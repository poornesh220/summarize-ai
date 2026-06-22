import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 1. THE NUCLEAR POLYFILL
// We define these BEFORE anything else loads to stop the "DOMMatrix is not defined" error
if (typeof window === 'undefined') {
    (global as any).DOMMatrix = class DOMMatrix {
        constructor() {}
    };
    (global as any).ImageData = class ImageData {
        constructor() {}
    };
    (global as any).Path2D = class Path2D {
        constructor() {}
    };
    (global as any).HTMLCanvasElement = class HTMLCanvasElement {
        constructor() {}
    };
}

export const runtime = 'nodejs';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    // 2. Load the library safely inside the function
    const pdf = require('pdf-parse');
    const parsePdf = typeof pdf === 'function' ? pdf : (pdf.default || pdf);

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const length = formData.get('length') || 'medium';

    if (!file) return NextResponse.json({ error: "No file found" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Extract text and tell the library to skip ALL rendering
    const data = await parsePdf(buffer, { 
        pagerender: () => "",
        max: 0 // Prevents the library from trying to do extra processing
    });
    
    const extractedText = data.text;

    if (!extractedText || extractedText.trim().length < 20) {
      return NextResponse.json({ error: "PDF is empty or an image." }, { status: 400 });
    }

    // 4. Send to Groq
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: `Summarize this text in ${length} length.` },
        { role: "user", content: extractedText.slice(0, 15000) }
      ],
    });

    return NextResponse.json({ summary: response.choices[0].message.content });

  } catch (error: any) {
    console.error("PDF_ERROR:", error.message);
    return NextResponse.json({ error: "Server Error: " + error.message }, { status: 500 });
  }
}