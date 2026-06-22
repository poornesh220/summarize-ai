import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { initDb } from '../../../lib/db';

const groq = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" });

export async function POST(req: Request) {
  try {
    const { text, length } = await req.json();
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { "type": "json_object" },
      messages: [
        { role: "system", content: `You are a professional analyst. Respond ONLY in JSON. 
          For length '${length}':
          - 'short': 2-3 sentences.
          - 'medium': 2-3 detailed paragraphs.
          - 'detailed': 5+ paragraphs with deep analysis and headers.
          JSON structure: {"summary": "your_long_text_here", "extracted_data": {"dates": [], "people": [], "topics": [], "sentiment": ""}}` 
        },
        { role: "user", content: text }
      ],
    });

    const data = JSON.parse(response.choices[0].message.content || "{}");
    const db = await initDb();
    await db.run('INSERT INTO extractions (type, filename, summary, structured_data) VALUES (?, ?, ?, ?)',
      ['text', 'manual_entry', data.summary, JSON.stringify(data.extracted_data)]);

    return NextResponse.json({ summary: data.summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}