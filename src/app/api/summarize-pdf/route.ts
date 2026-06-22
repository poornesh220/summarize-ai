import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as pdf from 'pdf-parse';

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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Extract text, skipping the problematic "page rendering"
    const data = await pdf(buffer, {
        pagerender: () => "" 
    });
    
    const extractedText = data.text;

    if (!extractedText || extractedText.length < 20) {
      return NextResponse.json({ error: "PDF is empty or a scanned image." }, { status: 400 });
    }

    // 2. Summarize
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { 
          role: "system", 
          content: `Summarize this text in a ${length} format.` 
        },
        { role: "user", content: extractedText.slice(0, 15000) }
      ],
    });

    return NextResponse.json({ summary: response.choices[0].message.content });

  } catch (error: any) {
    console.error("PDF API Error:", error.message);
    return NextResponse.json({ error: "Server Error: " + error.message }, { status: 500 });
  }
}