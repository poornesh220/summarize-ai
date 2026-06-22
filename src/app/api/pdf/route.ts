import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 1. Mock missing features for old PDF libraries
if (typeof global.DOMMatrix === 'undefined') { (global as any).DOMMatrix = class {}; }

export const runtime = 'nodejs';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    // 2. Load the library ONLY when needed (Lazy Loading)
    const pdf = require('pdf-parse');

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const length = formData.get('length') || 'medium';

    if (!file) return NextResponse.json({ error: "No file found" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Extract text skipping rendering (Prevents Canvas errors)
    const data = await pdf(buffer, { pagerender: () => "" });
    const extractedText = data.text;

    if (!extractedText || extractedText.length < 20) {
      return NextResponse.json({ error: "PDF is empty or an image." }, { status: 400 });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: `Summarize this text in ${length} length.` },
        { role: "user", content: extractedText.slice(0, 12000) }
      ],
    });

    return NextResponse.json({ summary: response.choices[0].message.content });
  } catch (error: any) {
    console.error("API_ERROR:", error.message);
    return NextResponse.json({ error: "Server Error: " + error.message }, { status: 500 });
  }
}