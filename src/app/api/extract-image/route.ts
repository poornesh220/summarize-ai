import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { initDb } from '../../../lib/db';

export const runtime = 'nodejs';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: "No image found" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString('base64');

    // Prompt optimized for "Structured Data Extraction" as per your screenshot
    const response = await groq.chat.completions.create({
      model: "llama-3.2-11b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Extract structured data from this image. If it is a receipt, get vendor and total. If a recipe, get ingredients. Return a summary followed by a JSON block." },
            { type: "image_url", image_url: { url: `data:${file.type};base64,${base64Image}` } }
          ],
        },
      ],
    });

    const aiContent = response.choices[0].message.content || "";
    
    // Save to SQLite
    const db = await initDb();
    await db.run(
      'INSERT INTO extractions (type, filename, summary, structured_data) VALUES (?, ?, ?, ?)',
      ['image', file.name, aiContent, JSON.stringify({ extracted_at: new Date() })]
    );

    return NextResponse.json({ result: aiContent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}