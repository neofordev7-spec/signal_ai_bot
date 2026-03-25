import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { config } from './env';

// Ensure data directory exists
const dbDir = path.dirname(config.dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(config.dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
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

  CREATE TABLE IF NOT EXISTS problems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'uncategorized',
    sentiment TEXT DEFAULT 'unknown',
    urgency INTEGER DEFAULT 3 CHECK (urgency >= 1 AND urgency <= 5),
    keywords TEXT DEFAULT '[]',
    lat REAL,
    lng REAL,
    image_url TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    vote_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    problem_id INTEGER NOT NULL REFERENCES problems(id),
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, problem_id)
  );

  CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category);
  CREATE INDEX IF NOT EXISTS idx_problems_created_at ON problems(created_at);
  CREATE INDEX IF NOT EXISTS idx_problems_vote_count ON problems(vote_count);
  CREATE INDEX IF NOT EXISTS idx_problems_urgency ON problems(urgency);
  CREATE INDEX IF NOT EXISTS idx_votes_problem_id ON votes(problem_id);
  CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
`);

console.log('SQLite database initialized at:', config.dbPath);
