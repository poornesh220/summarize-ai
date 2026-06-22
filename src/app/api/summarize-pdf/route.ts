import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    // 1. Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. Extract Text from PDF
    const pdfModule = await import('pdf-parse');
    const parsePdf = (pdfModule as any).default ?? pdfModule;
    const data = await (parsePdf as any)(buffer);
    const extractedText = data.text;

    if (!extractedText || extractedText.length < 10) {
      return NextResponse.json({ error: "Could not extract enough text from this PDF." }, { status: 400 });
    }

    // 3. Send to Groq for Summary
    const length = formData.get('length') || 'medium';
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: `You are an expert summarizer. Provide a ${length} summary of the following PDF content.` },
        { role: "user", content: extractedText.slice(0, 15000) } // Limiting text length for speed
      ],
    });

    return NextResponse.json({ summary: response.choices[0].message.content });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "PDF Processing Failed" }, { status: 500 });
  }
}