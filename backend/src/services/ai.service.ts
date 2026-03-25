import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env';

const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export interface AIAnalysis {
  category: string;
  sentiment: string;
  urgency: number;
  keywords: string[];
}

const VALID_CATEGORIES = [
  'infrastructure', 'education', 'healthcare', 'safety',
  'environment', 'transport', 'social', 'government', 'other'
];

const VALID_SENTIMENTS = ['positive', 'negative', 'neutral', 'urgent'];

export async function analyzeProblem(title: string, description: string): Promise<AIAnalysis> {
  const prompt = `You are an urban problem analyst. Analyze the following user-reported problem and return a JSON object with these fields:

- category: one of ${JSON.stringify(VALID_CATEGORIES)}
- sentiment: one of ${JSON.stringify(VALID_SENTIMENTS)}
- urgency: integer 1-5 (1=low, 5=critical)
- keywords: array of 3-5 keywords (in the same language as input)

Problem title: ${title}
Problem description: ${description}

Return ONLY valid JSON, no markdown, no code blocks.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Clean potential markdown code blocks
  const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned) as AIAnalysis;

  // Validate and sanitize
  if (!VALID_CATEGORIES.includes(parsed.category)) {
    parsed.category = 'other';
  }
  if (!VALID_SENTIMENTS.includes(parsed.sentiment)) {
    parsed.sentiment = 'neutral';
  }
  parsed.urgency = Math.max(1, Math.min(5, Math.round(parsed.urgency)));
  if (!Array.isArray(parsed.keywords)) {
    parsed.keywords = [];
  }

  return parsed;
}
