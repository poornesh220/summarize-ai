import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    // 1. Load the library
    const pdf = require('pdf-parse');

    // 2. THE FIX for "r is not a function"
    // We check if the function is the variable itself, or inside .default, or inside .module
    const parsePdf = typeof pdf === 'function' ? pdf : (pdf.default || pdf);

    if (typeof parsePdf !== 'function') {
        console.error("Library Load Error: parsePdf is not a function", pdf);
        return NextResponse.json({ error: "PDF Library failed to load correctly." }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const length = formData.get('length') || 'medium';

    if (!file) return NextResponse.json({ error: "No file found" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Extract text using the safe function we found
    const data = await parsePdf(buffer, { 
        pagerender: function() { return ""; } 
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
        { role: "user", content: extractedText.slice(0, 12000) }
      ],
    });

    return NextResponse.json({ summary: response.choices[0].message.content });

  } catch (error: any) {
    console.error("API_ERROR:", error.message);
    return NextResponse.json({ error: "Server Error: " + error.message }, { status: 500 });
  }
}