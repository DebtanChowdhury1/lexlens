import { describe, it, expect, vi } from 'vitest';

// Mock AI SDK modules so instantiation doesn't require real API keys
vi.mock('@/lib/ai/groq', () => ({ analyzeWithGroq: vi.fn() }));
vi.mock('@/lib/ai/gemini', () => ({
  analyzeWithGemini: vi.fn(),
  buildAnalysisPrompt: vi.fn(() => ''),
}));
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { scoreToRiskLevel, buildTextWindow, parseAIResponse } from '@/lib/ai/analyze';

// ── scoreToRiskLevel ──────────────────────────────────────────────────────────

describe('scoreToRiskLevel', () => {
  it('returns low for score 0', () => expect(scoreToRiskLevel(0)).toBe('low'));
  it('returns low for score 30 (boundary)', () => expect(scoreToRiskLevel(30)).toBe('low'));
  it('returns medium for score 31', () => expect(scoreToRiskLevel(31)).toBe('medium'));
  it('returns medium for score 55 (boundary)', () => expect(scoreToRiskLevel(55)).toBe('medium'));
  it('returns high for score 56', () => expect(scoreToRiskLevel(56)).toBe('high'));
  it('returns high for score 75 (boundary)', () => expect(scoreToRiskLevel(75)).toBe('high'));
  it('returns critical for score 76', () => expect(scoreToRiskLevel(76)).toBe('critical'));
  it('returns critical for score 100', () => expect(scoreToRiskLevel(100)).toBe('critical'));
});

// ── buildTextWindow ───────────────────────────────────────────────────────────

describe('buildTextWindow', () => {
  it('returns text unchanged when shorter than window', () => {
    const text = 'short contract text';
    expect(buildTextWindow(text)).toBe(text);
  });

  it('returns text unchanged when exactly at boundary (20000 chars)', () => {
    const text = 'a'.repeat(20000);
    expect(buildTextWindow(text)).toBe(text);
  });

  it('truncates to first+last window for long text', () => {
    const text = 'A'.repeat(15000) + 'MIDDLE'.repeat(1000) + 'Z'.repeat(5000);
    const result = buildTextWindow(text);
    expect(result).toContain('AAAA');
    expect(result).toContain('ZZZZ');
    expect(result).toContain('[... middle section omitted for length ...]');
    expect(result.length).toBeLessThan(text.length);
  });

  it('preserves first 15000 chars', () => {
    const text = 'X'.repeat(25000);
    const result = buildTextWindow(text);
    expect(result.startsWith('X'.repeat(100))).toBe(true);
  });
});

// ── parseAIResponse ───────────────────────────────────────────────────────────

const VALID_JSON = JSON.stringify({
  contractType: 'Employment Agreement',
  partyNames: ['Acme Corp', 'Jane Doe'],
  overallRiskScore: 72,
  summary: 'Test summary',
  keyFindings: ['Finding 1', 'Finding 2'],
  confidence: 8,
  governingLaw: 'California, USA',
  redFlags: [{ severity: 'high', title: 'Non-compete', description: 'Overly broad' }],
  clauses: [
    {
      id: 'clause-1',
      title: 'Non-Compete',
      originalText: 'Employee shall not compete...',
      plainEnglish: 'You cannot work for competitors',
      riskLevel: 'danger',
      riskScore: 70,
      category: 'Non-compete',
      explanation: 'This is broad',
      recommendation: 'Negotiate scope',
    },
  ],
});

describe('parseAIResponse', () => {
  it('parses a valid JSON response', () => {
    const result = parseAIResponse(VALID_JSON);
    expect(result.contractType).toBe('Employment Agreement');
    expect(result.overallRiskScore).toBe(72);
    expect(result.riskLevel).toBe('high'); // 72 → high (56–75)
    expect(result.confidence).toBe(8);
    expect(result.governingLaw).toBe('California, USA');
    expect(result.clauses).toHaveLength(1);
  });

  it('strips markdown code fences', () => {
    const result = parseAIResponse('```json\n' + VALID_JSON + '\n```');
    expect(result.contractType).toBe('Employment Agreement');
  });

  it('extracts JSON from surrounding text', () => {
    const result = parseAIResponse('Here is the analysis:\n' + VALID_JSON + '\nEnd.');
    expect(result.contractType).toBe('Employment Agreement');
  });

  it('uses scoreToRiskLevel, never trusts AI riskLevel field', () => {
    const withBadLabel = JSON.stringify({ ...JSON.parse(VALID_JSON), riskLevel: 'low', overallRiskScore: 80 });
    const result = parseAIResponse(withBadLabel);
    expect(result.riskLevel).toBe('critical'); // 80 → critical, ignores 'low' from AI
  });

  it('uses default overallRiskScore of 50 when missing', () => {
    const noScore = JSON.stringify({ ...JSON.parse(VALID_JSON), overallRiskScore: undefined });
    const result = parseAIResponse(noScore);
    expect(result.overallRiskScore).toBe(50);
    expect(result.riskLevel).toBe('medium');
  });

  it('clamps confidence to 1–10', () => {
    const highConf = JSON.stringify({ ...JSON.parse(VALID_JSON), confidence: 99 });
    expect(parseAIResponse(highConf).confidence).toBe(10);

    const lowConf = JSON.stringify({ ...JSON.parse(VALID_JSON), confidence: -5 });
    expect(parseAIResponse(lowConf).confidence).toBe(1);
  });

  it('defaults missing fields gracefully', () => {
    const minimal = JSON.stringify({ overallRiskScore: 20 });
    const result = parseAIResponse(minimal);
    expect(result.contractType).toBe('Unknown Contract');
    expect(result.partyNames).toEqual([]);
    expect(result.clauses).toEqual([]);
    expect(result.redFlags).toEqual([]);
  });

  it('throws on invalid JSON', () => {
    expect(() => parseAIResponse('not json at all')).toThrow();
  });

  it('truncates originalText to 300 chars', () => {
    const longText = JSON.stringify({
      ...JSON.parse(VALID_JSON),
      clauses: [{ ...JSON.parse(VALID_JSON).clauses[0], originalText: 'x'.repeat(500) }],
    });
    const result = parseAIResponse(longText);
    expect(result.clauses[0].originalText.length).toBeLessThanOrEqual(300);
  });

  it('defaults invalid riskLevel to caution', () => {
    const badLevel = JSON.stringify({
      ...JSON.parse(VALID_JSON),
      clauses: [{ ...JSON.parse(VALID_JSON).clauses[0], riskLevel: 'unknown' }],
    });
    const result = parseAIResponse(badLevel);
    expect(result.clauses[0].riskLevel).toBe('caution');
  });
});

// ── isMagicValid (inline, since it's not exported from the route) ─────────────

describe('isMagicValid (inline copy)', () => {
  const MAGIC: Record<string, number[][]> = {
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
      [0x50, 0x4b, 0x03, 0x04],
      [0x50, 0x4b, 0x05, 0x06],
    ],
  };

  function isMagicValid(buf: Buffer, mime: string): boolean {
    const sigs = MAGIC[mime];
    if (!sigs) return true;
    return sigs.some((sig) => sig.length <= buf.length && sig.every((byte, i) => buf[i] === byte));
  }

  it('accepts a valid PDF magic bytes', () => {
    const buf = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x00]);
    expect(isMagicValid(buf, 'application/pdf')).toBe(true);
  });

  it('rejects wrong magic bytes for PDF', () => {
    const buf = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
    expect(isMagicValid(buf, 'application/pdf')).toBe(false);
  });

  it('accepts valid DOCX magic bytes (PK03)', () => {
    const buf = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00]);
    const mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    expect(isMagicValid(buf, mime)).toBe(true);
  });

  it('returns true for unknown MIME (no restriction)', () => {
    const buf = Buffer.from([0x00, 0x01, 0x02]);
    expect(isMagicValid(buf, 'text/plain')).toBe(true);
  });

  it('returns false for buffer shorter than signature', () => {
    const buf = Buffer.from([0x25, 0x50]); // only 2 bytes, PDF sig is 4
    expect(isMagicValid(buf, 'application/pdf')).toBe(false);
  });

  it('returns false for empty buffer', () => {
    const buf = Buffer.alloc(0);
    expect(isMagicValid(buf, 'application/pdf')).toBe(false);
  });
});

// ── sanitizeName (inline copy) ────────────────────────────────────────────────

describe('sanitizeName (inline copy)', () => {
  function sanitizeName(raw: string | null | undefined): string {
    if (!raw) return '';
    return raw.trim().replace(/[<>"`\\]/g, '').slice(0, 100);
  }

  it('strips dangerous characters', () => {
    expect(sanitizeName('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
  });

  it('preserves apostrophes (O\'Brien pattern)', () => {
    expect(sanitizeName("O'Brien Employment Agreement")).toBe("O'Brien Employment Agreement");
  });

  it('strips backticks', () => {
    expect(sanitizeName('`rm -rf /`')).toBe('rm -rf /');
  });

  it('trims whitespace', () => {
    expect(sanitizeName('  my contract  ')).toBe('my contract');
  });

  it('truncates to 100 chars', () => {
    const long = 'a'.repeat(200);
    expect(sanitizeName(long)).toHaveLength(100);
  });

  it('returns empty string for null/undefined', () => {
    expect(sanitizeName(null)).toBe('');
    expect(sanitizeName(undefined)).toBe('');
    expect(sanitizeName('')).toBe('');
  });
});
