import Groq from 'groq-sdk';
import { buildAnalysisPrompt } from './gemini';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI_TIMEOUT')), ms)
    ),
  ]);
}

export async function analyzeWithGroq(contractText: string, governingLaw?: string): Promise<string> {
  const completion = await withTimeout(
    groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a contract analysis AI. You MUST respond with ONLY a valid JSON object. No explanation, no markdown, no text before or after the JSON. Start your response with { and end with }.',
        },
        {
          role: 'user',
          content: buildAnalysisPrompt(contractText, governingLaw),
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 5000,
    }),
    25000
  );

  return completion.choices[0]?.message?.content ?? '';
}
