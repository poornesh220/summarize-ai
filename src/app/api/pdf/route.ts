import { NextResponse } from 'next/server';
import OpenAI from 'openai';
// Use the fork version which is Vercel-friendly
import pdf from 'pdf-parse-fork';

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

    // 1. Extract text using the fork library
    // We pass pagerender: false to ensure it doesn't try to use 'canvas'
    let data;
    try {
        data = await pdf(buffer, { 
            pagerender: function() { return ""; } 
        });
    } catch (parseError: any) {
        console.error("Parse Error:", parseError);
        return NextResponse.json({ error: "Failed to read PDF. It might be encrypted." }, { status: 500 });
    }
    
    const extractedText = data.text;

    if (!extractedText || extractedText.trim().length < 10) {
      return NextResponse.json({ error: "PDF is empty or an image/scan." }, { status: 400 });
    }

    // 2. Summarize with Groq
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { 
          role: "system", 
          content: `You are an expert summarizer. Summarize this content in ${length} length.` 
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