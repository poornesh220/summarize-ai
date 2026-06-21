import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { text, length } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using a faster, cheaper model
      messages: [
        { 
          role: "system", 
          content: `You are an expert summarization assistant. Create a ${length} summary of the provided text.` 
        },
        { role: "user", content: text }
      ],
    });

    return NextResponse.json({ summary: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "AI Failed" }, { status: 500 });
  }
}