import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { config } from './env';

let db: any;

export async function initDB() {
  if (db) return db;

  const dbDir = path.dirname(config.dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(config.dbPath)) {
    const buffer = fs.readFileSync(config.dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
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
      status TEXT DEFAULT 'open',
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
  `);

  db.run("CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category)");
  db.run("CREATE INDEX IF NOT EXISTS idx_problems_vote_count ON problems(vote_count)");
  db.run("CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id)");

  saveDB();
  console.log('SQLite database initialized at:', config.dbPath);
  return db;
}

export function getDB(): any {
  if (!db) throw new Error('Database not initialized');
  return db;
}

export function saveDB() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(config.dbPath, buffer);
}

setInterval(saveDB, 30000);
