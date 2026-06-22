import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import pdf from 'pdf-parse';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const length = formData.get('length') || 'medium';

    if (!file) {
      return NextResponse.json({ error: "No file found in request" }, { status: 400 });
    }

    // 1. Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Extract Text from PDF
    let extractedText = '';
    try {
      const data = await pdf(buffer);
      extractedText = data.text;
    } catch (pdfError: any) {
      console.error("PDF Parsing Error:", pdfError);
      return NextResponse.json({ error: "Failed to read the PDF content. Is it password protected?" }, { status: 500 });
    }

    if (!extractedText || extractedText.trim().length < 20) {
      return NextResponse.json({ error: "This PDF seems to be an image/scan. AI cannot read text from images yet." }, { status: 400 });
    }

    // 3. Send to AI
    try {
      const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { 
            role: "system", 
            content: `You are an expert summarizer. Provide a ${length} summary of the following text, focusing on key historical events, geography, and important figures.` 
          },
          { role: "user", content: extractedText.slice(0, 12000) } 
        ],
      });

      return NextResponse.json({ summary: response.choices[0].message.content });
    } catch (aiError: any) {
      console.error("AI Error:", aiError);
      return NextResponse.json({ error: "AI failed to generate summary: " + aiError.message }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Global Error:", error);
    return NextResponse.json({ error: "Critical Error: " + error.message }, { status: 500 });
  }
}