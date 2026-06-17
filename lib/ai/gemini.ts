import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI_TIMEOUT')), ms)
    ),
  ]);
}

export async function analyzeWithGemini(contractText: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { temperature: 0.3 },
  });
  const prompt = buildAnalysisPrompt(contractText);
  const result = await withTimeout(model.generateContent(prompt), 25000);
  const response = await result.response;
  return response.text();
}

export function buildAnalysisPrompt(contractText: string, governingLaw?: string): string {
  // Escape triple-quotes inside contract text to prevent prompt boundary break
  const safeText = contractText.replace(/"""/g, "'''");
  // Truncate originalText snippets to 300 chars — enforced in prompt instructions
  const jurisdictionNote = governingLaw
    ? `This contract appears to be governed by ${governingLaw}. Apply relevant legal standards for that jurisdiction.`
    : 'Apply general international contract law standards.';

  return `You are LexLens AI, an expert contract attorney. Analyze the document below and return ONLY a JSON object — no markdown, no explanation, no text outside the JSON.

IMPORTANT: If the document is NOT a legal contract (e.g. it is a resume, CV, essay, article, invoice, or other non-contract document), return this exact JSON and nothing else:
{"notAContract": true, "documentType": "describe what it actually is in 3 words or less"}

Jurisdiction note: ${jurisdictionNote}

Risk score calibration anchors:
- A standard NDA with balanced terms and no unusual clauses = score 10–15
- A typical freelance service agreement with normal terms = score 20–30
- An employment contract with a 2-year non-compete = score 45–55
- A one-sided employment contract with IP grab + no severance = score 75–85
- A contract where employee waives all rights, pays arbitration costs, and cannot discuss terms = score 90–100

CONTRACT TEXT:
"""
${safeText}
"""

Return this exact JSON structure (fill every field):
{
  "contractType": "e.g. Employment Agreement, NDA, Service Contract, Lease",
  "partyNames": ["Party 1 name", "Party 2 name"],
  "overallRiskScore": 0,
  "summary": "2-3 sentence plain English summary of what this contract does and who it favors.",
  "keyFindings": ["Finding 1", "Finding 2", "Finding 3"],
  "confidence": 8,
  "governingLaw": "e.g. California, USA or West Bengal, India or Not specified",
  "redFlags": [
    {
      "severity": "high",
      "title": "Short dangerous headline",
      "description": "Plain English explanation of why this clause is dangerous."
    }
  ],
  "clauses": [
    {
      "id": "clause-1",
      "title": "Clause Name",
      "originalText": "Exact quote from the contract (max 300 chars)",
      "plainEnglish": "What this clause means in simple terms",
      "riskLevel": "safe",
      "riskScore": 10,
      "category": "Payment",
      "explanation": "Why this is risky or safe for the user",
      "recommendation": "What the user should do or negotiate about this clause"
    }
  ]
}

Rules:
- overallRiskScore: 0–100 integer only (use the calibration anchors above)
- DO NOT include a "riskLevel" field — it will be computed from overallRiskScore
- confidence: 1–10 how confident you are in this analysis (10 = very clear contract, 1 = vague/confusing document)
- keyFindings: 3–7 items based on actual contract content, not always exactly 5
- clause riskLevel: must be exactly one of: safe, caution, danger, critical
- clause riskScore: 0–100 integer
- clause category: one of: Payment, Termination, IP/Ownership, Liability, Privacy, Non-compete, Dispute, Other
- originalText: max 300 characters — truncate with "..." if longer
- redFlags: only include if genuinely dangerous (severity: high or critical). Empty array [] if none.
- Respond with ONLY the JSON object, nothing else`;
}
