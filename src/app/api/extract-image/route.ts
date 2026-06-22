import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { initDb } from '../../../lib/db';

const groq = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const length = formData.get('length') || 'medium';
    const bytes = await file.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString('base64');

    const response = await groq.chat.completions.create({
      model: "qwen/qwen3.6-27b",
      response_format: { "type": "json_object" },
      messages: [
        { role: "user", content: [
          { type: "text", text: `Analyze this image. Respond ONLY in JSON. 
            If length is 'detailed', provide an exhaustive list of every detail.
            JSON: {"summary": "description_here", "extracted_data": {"vendor": "", "total_amount": "", "currency": "", "items": [], "date": ""}}` },
          { type: "image_url", image_url: { url: `data:${file.type};base64,${base64Image}` } }
        ]}
      ],
    });

    const data = JSON.parse(response.choices[0].message.content || "{}");
    const db = await initDb();
    await db.run('INSERT INTO extractions (type, filename, summary, structured_data) VALUES (?, ?, ?, ?)',
      ['image', file.name, data.summary, JSON.stringify(data.extracted_data)]);

    return NextResponse.json({ result: data.summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}