import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// We use 'require' because pdf-parse is an older library
const pdf = require('pdf-parse');

export const runtime = 'nodejs';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const length = formData.get('length') || 'medium';

    if (!file) {
      return NextResponse.json({ error: "No file found" }, { status: 400 });
    }

    // 1. Convert to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Extract Text using the legacy-safe method
    let extractedText = '';
    try {
      const data = await pdf(buffer);
      extractedText = data.text;
    } catch (e) {
      console.error("PDF Parse Error:", e);
      return NextResponse.json({ error: "Failed to read PDF structure" }, { status: 500 });
    }

    if (!extractedText || extractedText.length < 20) {
      return NextResponse.json({ error: "PDF is empty or an image." }, { status: 400 });
    }

    // 3. Summarize with Groq
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { 
          role: "system", 
          content: `Summarize this text in a ${length} format. Focus on facts.` 
        },
        { role: "user", content: extractedText.slice(0, 15000) }
      ],
    });

    return NextResponse.json({ summary: response.choices[0].message.content });

  } catch (error: any) {
    console.error("Global Error:", error.message);
    return NextResponse.json({ error: "Server Error: " + error.message }, { status: 500 });
  }
}