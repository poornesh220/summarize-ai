import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { text, length } = await req.json();

    const prompt = `You are an expert summarization assistant. 
    Read the provided content and create a ${length} summary. 
    Focus on key points, important facts, decisions, action items and conclusions.
    
    Content: ${text}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.5,
    });

    return NextResponse.json({ summary: response.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}