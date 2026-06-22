import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Force Node.js runtime
export const runtime = 'nodejs';
// Prevent Next.js from trying to pre-render this route
export const dynamic = 'force-dynamic';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    // We import it INSIDE the function so it doesn't load during Vercel's build process
    const pdf = require('pdf-parse-fork');

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const length = formData.get('length') || 'medium';

    if (!file) {
      return NextResponse.json({ error: "No file found" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract Text
    let extractedText = '';
    try {
      // The second argument { pagerender: false } is key to avoiding canvas errors
      const data = await pdf(buffer, { 
        pagerender: function() { return ""; } 
      });
      extractedText = data.text;
    } catch (e: any) {
      console.error("PDF extraction error:", e.message);
      return NextResponse.json({ error: "Failed to read PDF content" }, { status: 500 });
    }

    if (!extractedText || extractedText.length < 20) {
      return NextResponse.json({ error: "PDF is empty or an image/scan." }, { status: 400 });
    }

    // AI Summarization
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { 
          role: "system", 
          content: `You are an expert summarizer. Provide a ${length} summary focusing on facts and key takeaways.` 
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