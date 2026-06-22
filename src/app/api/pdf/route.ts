import { NextResponse } from 'next/server';
import OpenAI from 'openai';
// @ts-ignore
import pdf from 'pdf-parse-fork';
import { initDb } from '../../../lib/db';

export const runtime = 'nodejs';

const groq = new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY, 
  baseURL: "https://api.groq.com/openai/v1" 
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const length = formData.get('length') || 'medium';
    
    const arrayBuffer = await file.arrayBuffer();
    const pdfData = await pdf(Buffer.from(arrayBuffer));
    const extractedText = pdfData.text.replace(/\s+/g, ' ').trim();

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { "type": "json_object" }, // Crucial for Excel data
      messages: [
        { role: "system", content: `You are an academic researcher. Respond ONLY in a JSON object.
          
          Guidelines for the "summary" field:
          - If length is 'short': 2-3 sentences.
          - If length is 'medium': 3 paragraphs.
          - If length is 'detailed': 6+ paragraphs with deep analysis.

          JSON structure must be: 
          {
            "summary": "the text content here",
            "extracted_data": {
               "author": "string",
               "topics": [],
               "dates": []
            }
          }` 
        },
        { role: "user", content: extractedText.slice(0, 15000) }
      ],
    });

    // 1. Parse the AI response
    const rawContent = response.choices[0].message.content || "{}";
    const parsedData = JSON.parse(rawContent);

    // 2. SAFETY CHECK: Find the summary even if the AI used a different key
    const finalSummary = parsedData.summary || parsedData.Summary || parsedData.text || "Could not generate summary text.";
    const extraData = parsedData.extracted_data || {};

    // 3. Save to Database for your Excel Export
    try {
        const db = await initDb();
        await db.run(
          'INSERT INTO extractions (type, filename, summary, structured_data) VALUES (?, ?, ?, ?)',
          ['pdf', file.name, finalSummary, JSON.stringify(extraData)]
        );
    } catch (dbErr) {
        console.error("DB Error:", dbErr);
    }

    // 4. Return to Frontend
    return NextResponse.json({ 
      summary: finalSummary 
    });

  } catch (error: any) {
    console.error("PDF API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}