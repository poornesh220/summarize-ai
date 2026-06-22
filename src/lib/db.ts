import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// This creates a file named 'summarize_ai.sqlite' in your project root
export async function initDb() {
  const db = await open({
    filename: path.join(process.cwd(), 'summarize_ai.sqlite'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS extractions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT, -- 'pdf', 'text', 'voice', 'image'
      filename TEXT,
      summary TEXT,
      structured_data TEXT, -- JSON string
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
}