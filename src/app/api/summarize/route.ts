import { NextResponse } from 'next/server';
import OpenAI from 'openai'; // Groq uses the OpenAI library!

// 1. Initialize Groq (Pointing to their "door" instead of OpenAI's)
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY, // We will change this name in Vercel too
  baseURL: "https://api.groq.com/openai/v1", // This is the magic line
});

export async function POST(req: Request) {
  try {
    const { text, length } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Groq Key missing" }, { status: 500 });
    }

    // 2. Call Groq using the Llama-3 model (which is free)
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", 
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
    console.error("GROQ_ERROR:", error.message);
    return NextResponse.json({ error: "AI Failed: Check your Free Tier limits" }, { status: 500 });
  }
}