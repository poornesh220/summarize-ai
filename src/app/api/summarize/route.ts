import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { initDb } from '../../../lib/db'; // Import our database helper

export const runtime = 'nodejs';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const { text, length } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Groq Key missing" }, { status: 500 });
    }

    // 1. Call Groq with a dual-purpose prompt: Summary + Structured Data
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", 
      messages: [
        { 
          role: "system", 
          content: `You are an expert data extraction assistant. 
          First, provide a clear ${length} summary of the text. 
          Second, extract key data points (like dates, names, prices, or topics) in a structured JSON block at the end.` 
        },
        { role: "user", content: text }
      ],
    });

    const aiResult = response.choices[0].message.content || "";

    // 2. SAVE TO DATABASE
    try {
        const db = await initDb();
        
        // We save the 'type' as 'text' and the 'filename' as 'manual_entry'
        // We store the whole result in the summary column for now
        await db.run(
          'INSERT INTO extractions (type, filename, summary, structured_data) VALUES (?, ?, ?, ?)',
          [
            'text', 
            'manual_entry', 
            aiResult, 
            JSON.stringify({ input_length: text.length, date_processed: new Date().toISOString() })
          ]
        );
        console.log("Data successfully saved to SQLite database.");
    } catch (dbError) {
        console.error("Database Save Error:", dbError);
        // We don't stop the request even if DB fails, so the user still sees the summary
    }

    // 3. Return the summary to your UI
    return NextResponse.json({ summary: aiResult });

  } catch (error: any) {
    console.error("GROQ_ERROR:", error.message);
    return NextResponse.json({ error: "AI Failed: Check your Free Tier limits" }, { status: 500 });
  }
}