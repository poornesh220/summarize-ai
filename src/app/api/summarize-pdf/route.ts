import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 1. THE FIX: Mock missing browser globals for pdf-parse
if (typeof global.DOMMatrix === 'undefined') {
  (global as any).DOMMatrix = class {};
}
if (typeof global.ImageData === 'undefined') {
  (global as any).ImageData = class {};
}
if (typeof global.Path2D === 'undefined') {
  (global as any).Path2D = class {};
}

// 2. Force Node.js runtime and dynamic behavior
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 3. Import pdf-parse INSIDE the request to prevent build-time crashes
// We use require() here because it's safer for this specific library
const pdf = require('pdf-parse');

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

    // Convert to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract Text
    let extractedText = '';
    try {
      // We pass a second argument to disable the "rendering" that causes the canvas errors
      const data = await pdf(buffer, { pagerender: () => "" });
      extractedText = data.text;
    } catch (e) {
      console.error("PDF Parse Error:", e);
      return NextResponse.json({ error: "Failed to read PDF structure" }, { status: 500 });
    }

    if (!extractedText || extractedText.length < 20) {
      return NextResponse.json({ error: "PDF is empty or contains only images." }, { status: 400 });
    }

    // Summarize with Groq
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { 
          role: "system", 
          content: `You are an expert summarizer. Summarize this content in a ${length} format.` 
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