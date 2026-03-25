import dotenv from 'dotenv';
import path from 'path';
import Database from 'better-sqlite3';
import fs from 'fs';
import { createBot } from './bot';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const botToken = process.env.BOT_TOKEN;
const webappUrl = process.env.WEBAPP_URL;
const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../../data/signalai.db');

if (!botToken) {
  console.error('BOT_TOKEN is required');
  process.exit(1);
}
if (!webappUrl) {
  console.error('WEBAPP_URL is required');
  process.exit(1);
}

// Ensure data directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Ensure users table exists (backend creates it, but bot might start first)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    is_admin INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

const bot = createBot(botToken, webappUrl, db);

bot.launch().then(() => {
  console.log('SignalAI Bot is running!');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
