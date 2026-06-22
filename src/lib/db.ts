import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export async function initDb() {
  return open({
    filename: path.join(process.cwd(), 'summarize_ai.sqlite'),
    driver: sqlite3.Database
  });
}