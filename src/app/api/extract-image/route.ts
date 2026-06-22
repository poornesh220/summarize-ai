import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { initDb } from '../../../lib/db';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: "No image found" }, { status: 400 });

    // 1. Convert image to Base64 for Groq Vision
    const bytes = await file.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString('base64');

    // 2. Call Groq Vision
    const response = await groq.chat.completions.create({
      model: "llama-3.2-11b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image. Provide a concise summary and then extract structured data (like total amount, date, items, or topics) in JSON format." },
            { type: "image_url", image_url: { url: `data:${file.type};base64,${base64Image}` } }
          ],
        },
      ],
    });

    const aiContent = response.choices[0].message.content || "";
    
    // 3. Save to Database
    const db = await initDb();
    await db.run(
      'INSERT INTO extractions (type, filename, summary, structured_data) VALUES (?, ?, ?, ?)',
      ['image', file.name, aiContent, JSON.stringify({ source: "vision_extraction" })]
    );

    return NextResponse.json({ result: aiContent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}