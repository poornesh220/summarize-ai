import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 1. Initialize OpenAI
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export async function POST(req: Request) {
  try {
    const { text, length } = await req.json();

    // 2. Check if API Key is even there
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API Key is missing from environment variables" }, { status: 500 });
    }

    // 3. Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Most reliable model for beginners
      messages: [
        { 
          role: "system", 
          content: `You are an expert summarization assistant. Create a ${length} summary.` 
        },
        { role: "user", content: text }
      ],
    });

    return NextResponse.json({ summary: response.choices[0].message.content });

  } catch (error: any) {
    // This logs the REAL error to your Vercel Dashboard logs
    console.error("OPENAI_ERROR:", error.message);
    
    return NextResponse.json({ 
      error: `AI Failed: ${error.message}` // This will now tell you the exact reason in the toast
    }, { status: 500 });
  }
}