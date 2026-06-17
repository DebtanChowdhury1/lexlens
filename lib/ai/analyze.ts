import { analyzeWithGemini } from './gemini';
import { analyzeWithGroq } from './groq';
import { logger } from '@/lib/logger';
import type { AIAnalysisResult } from '@/types/analysis';

export function scoreToRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score <= 30) return 'low';
  if (score <= 55) return 'medium';
  if (score <= 75) return 'high';
  return 'critical';
}

export function buildTextWindow(text: string): string {
  const FIRST = 15000;
  const LAST  = 5000;
  if (text.length <= FIRST + LAST) return text;
  const first = text.slice(0, FIRST);
  const last  = text.slice(-LAST);
  return `${first}\n\n[... middle section omitted for length ...]\n\n${last}`;
}

export function parseAIResponse(raw: string): AIAnalysisResult & { confidence: number; governingLaw?: string } {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  if (!cleaned.startsWith('{')) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON object found in AI response');
    cleaned = match[0];
  }

  const parsed = JSON.parse(cleaned);

  const overallRiskScore = typeof parsed.overallRiskScore === 'number' ? parsed.overallRiskScore : 50;

  return {
    contractType:     parsed.contractType ?? 'Unknown Contract',
    partyNames:       Array.isArray(parsed.partyNames) ? parsed.partyNames : [],
    overallRiskScore,
    // #12 — always derive from score, ignore AI's label
    riskLevel:        scoreToRiskLevel(overallRiskScore),
    summary:          parsed.summary ?? '',
    keyFindings:      Array.isArray(parsed.keyFindings) ? parsed.keyFindings : [],
    redFlags:         Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
    // #14 — confidence field
    confidence:       typeof parsed.confidence === 'number' ? Math.min(10, Math.max(1, parsed.confidence)) : 7,
    governingLaw:     typeof parsed.governingLaw === 'string' ? parsed.governingLaw : undefined,
    clauses: Array.isArray(parsed.clauses) ? parsed.clauses.map((c: any, i: number) => ({
      id:             c.id ?? `clause-${i}`,
      title:          c.title ?? `Clause ${i + 1}`,
      // #94 — enforce 300 char limit on originalText server-side
      originalText:   (c.originalText ?? '').slice(0, 300),
      plainEnglish:   c.plainEnglish ?? '',
      riskLevel:      (['safe', 'caution', 'danger', 'critical'].includes(c.riskLevel?.toLowerCase())
                        ? c.riskLevel.toLowerCase()
                        : 'caution') as 'safe' | 'caution' | 'danger' | 'critical',
      riskScore:      typeof c.riskScore === 'number' ? c.riskScore : 50,
      category:       c.category ?? 'Other',
      explanation:    c.explanation ?? '',
      recommendation: c.recommendation ?? '',
    })) : [],
  };
}

const NON_RETRYABLE_STATUSES = new Set([400, 413, 422]);

async function tryWithRetry<T>(
  fn: () => Promise<T>,
  retries: number,
  label: string
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      const status = err?.status ?? err?.statusCode ?? err?.response?.status;
      if (NON_RETRYABLE_STATUSES.has(status)) {
        logger.warn(`[AI] ${label} non-retryable error (${status}), skipping retry`, { error: err.message });
        throw err;
      }
      if (attempt < retries) {
        logger.warn(`[AI] ${label} attempt ${attempt + 1} failed, retrying…`, { error: err.message });
        await new Promise((res) => setTimeout(res, 1000 * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}

export async function analyzeContract(contractText: string): Promise<{
  result: AIAnalysisResult & { confidence: number; governingLaw?: string };
  model: string;
  processingTime: number;
}> {
  const startTime = Date.now();

  // #13 — clean + sliding window
  const cleanedText = contractText
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
  const windowedText = buildTextWindow(cleanedText);

  logger.info('[AI] Starting analysis', { textLength: cleanedText.length, windowLength: windowedText.length });

  let raw: string;
  let model: string;

  try {
    raw = await tryWithRetry(() => analyzeWithGroq(windowedText), 1, 'Groq');
    model = 'llama-3.3-70b-versatile';
    logger.info('[AI] Groq responded', { length: raw.length });
  } catch (groqError: any) {
    if (groqError.message === 'AI_TIMEOUT') {
      logger.warn('[AI] Groq timed out (with retry), falling back to Gemini');
    } else {
      logger.warn('[AI] Groq failed (with retry), falling back to Gemini', { error: groqError.message });
    }
    try {
      raw = await tryWithRetry(() => analyzeWithGemini(windowedText), 1, 'Gemini');
      model = 'gemini-2.0-flash';
      logger.info('[AI] Gemini responded', { length: raw.length });
    } catch (geminiError: any) {
      logger.error('[AI] Both providers failed after retries', { error: geminiError.message });
      throw new Error('AI_BOTH_FAILED');
    }
  }

  // Check for non-contract document
  try {
    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const peek = JSON.parse(cleaned.match(/\{[\s\S]*\}/)?.[0] ?? '{}');
    if (peek.notAContract === true) {
      const docType = peek.documentType ?? 'non-contract document';
      throw new Error(`NOT_A_CONTRACT:${docType}`);
    }
  } catch (e: any) {
    if (e.message?.startsWith('NOT_A_CONTRACT:')) throw e;
  }

  let result: AIAnalysisResult & { confidence: number; governingLaw?: string };
  try {
    result = parseAIResponse(raw);
  } catch (parseError: any) {
    logger.error('[AI] JSON parse failed', { rawPreview: raw.slice(0, 500) });
    throw new Error('AI_PARSE_FAILED');
  }

  const processingTime = Date.now() - startTime;

  // #79 — quality logging
  logger.info('[AI] Analysis complete', {
    model,
    processingTime,
    overallRiskScore: result.overallRiskScore,
    riskLevel: result.riskLevel,
    clauseCount: result.clauses.length,
    redFlagCount: result.redFlags.length,
    confidence: result.confidence,
  });

  return { result, model, processingTime };
}
