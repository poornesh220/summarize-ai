import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { initDb } from '../../../lib/db';

const groq = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const transcription = await groq.audio.transcriptions.create({ file: file, model: "whisper-large-v3" });

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { "type": "json_object" },
      messages: [
        { role: "system", content: `Analyze the transcript. Respond ONLY in JSON: {"summary": "detailed summary", "extracted_data": {"topics": [], "action_items": [], "names_mentioned": []}}` },
        { role: "user", content: transcription.text }
      ],
    });

    const data = JSON.parse(response.choices[0].message.content || "{}");
    const db = await initDb();
    await db.run('INSERT INTO extractions (type, filename, summary, structured_data) VALUES (?, ?, ?, ?)',
      ['voice', file.name || 'voice_note.wav', data.summary, JSON.stringify(data.extracted_data)]);

    return NextResponse.json({ text: transcription.text, summary: data.summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}