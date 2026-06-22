import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 1. POLYFILLS: Stop the DOMMatrix/Canvas errors
if (typeof global.DOMMatrix === 'undefined') {
    (global as any).DOMMatrix = class {};
    (global as any).ImageData = class {};
    (global as any).Path2D = class {};
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    // 2. THE MANUAL FIX: 
    // Point directly to the internal logic file to avoid minifier renaming errors
    const pdf = require('pdf-parse/lib/pdf-parse.js');

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const length = formData.get('length') || 'medium';

    if (!file) return NextResponse.json({ error: "No file found" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Extraction with the rendering disabled
    let extractedText = '';
    try {
      const data = await pdf(buffer, { 
        pagerender: () => "" 
      });
      extractedText = data.text;
    } catch (parseError: any) {
        console.error("Parse Error:", parseError.message);
        return NextResponse.json({ error: "Failed to read PDF structure." }, { status: 500 });
    }

    if (!extractedText || extractedText.trim().length < 10) {
      return NextResponse.json({ error: "PDF is empty or an image/scan." }, { status: 400 });
    }

    // 4. AI Summary
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { 
          role: "system", 
          content: `You are an expert summarizer. Summarize this text in ${length} length.` 
        },
        { role: "user", content: extractedText.slice(0, 15000) }
      ],
    });

    return NextResponse.json({ summary: response.choices[0].message.content });

  } catch (error: any) {
    console.error("GLOBAL_API_ERROR:", error.message);
    return NextResponse.json({ error: "Server Error: " + error.message }, { status: 500 });
  }
}