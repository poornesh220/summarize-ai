import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize Groq for Transcription
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Groq Key missing" }, { status: 500 });
    }

    // Use Groq's Whisper model (Free and fast!)
    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3",
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error: any) {
    console.error("Transcription Error:", error.message);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}