import { NextResponse } from 'next/server';
import OpenAI from 'openai';
// @ts-ignore
import pdf from 'pdf-parse-fork';

export const runtime = 'nodejs';

// Initialize Groq
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
      return NextResponse.json({ error: "No file found" }, { status: 400 });
    }

    // 1. Convert the uploaded file into a Buffer that the PDF library can read
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Extract text from the PDF
    let data;
    try {
        data = await pdf(buffer);
    } catch (parseError: any) {
        console.error("PDF Parsing Library Error:", parseError.message);
        return NextResponse.json({ error: "The PDF file is corrupted or protected." }, { status: 500 });
    }
    
    // 3. Clean up the text (remove weird spacing)
    const extractedText = data.text.replace(/\s+/g, ' ').trim();

    // --- DEBUGGING LOGS (View these in Vercel Dashboard > Logs) ---
    console.log("File Name:", file.name);
    console.log("Character Count Extracted:", extractedText.length);
    console.log("Snippet:", extractedText.substring(0, 150));
    // -------------------------------------------------------------

    // 4. Check if we actually found any text
    if (extractedText.length < 20) {
      return NextResponse.json({ 
        error: "PDF is empty or a scanned image. AI cannot find a text layer to read. Try a PDF where you can highlight the text with your mouse." 
      }, { status: 400 });
    }

    // 5. Send the text to Groq for summarization
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { 
          role: "system", 
          content: `You are an expert summarizer. Provide a ${length} summary of the following text. Use bullet points for key facts.` 
        },
        { role: "user", content: extractedText.slice(0, 15000) } // Send up to 15k characters
      ],
    });

    return NextResponse.json({ summary: response.choices[0].message.content });

  } catch (error: any) {
    console.error("GLOBAL_API_ERROR:", error.message);
    return NextResponse.json({ error: "Server Error: " + error.message }, { status: 500 });
  }
}