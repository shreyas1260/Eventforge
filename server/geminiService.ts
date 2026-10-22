import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const client = apiKey && apiKey !== 'replace_with_your_gemini_api_key' ? new GoogleGenAI({ apiKey }) : null;

const FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
const CANDIDATE_MODELS = Array.from(
  new Set([process.env.GEMINI_MODEL, ...FALLBACK_MODELS].filter((m): m is string => Boolean(m)))
);

export async function callGemini(prompt: string, jsonMode = true): Promise<{ text: string; model: string }> {
  if (!client) {
    throw new Error('GEMINI_API_KEY is not configured on server.');
  }

  let lastError: unknown = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: jsonMode ? { responseMimeType: 'application/json' } : undefined,
      });

      if (response.text) {
        return { text: response.text, model };
      }
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('Model generation failed');
}

export function isGeminiConfigured(): boolean {
  return Boolean(client);
}
