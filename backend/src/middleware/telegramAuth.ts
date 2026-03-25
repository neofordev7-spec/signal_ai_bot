import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import { getDB, saveDB } from '../config/db';
import { validateInitData, TelegramUser } from '../utils/telegram';

declare global {
  namespace Express {
    interface Request {
      telegramUser?: TelegramUser;
      dbUserId?: number;
    }
  }
}

function upsertUser(user: TelegramUser): number {
  const db = getDB();
  // Try insert
  db.run(
    `INSERT OR IGNORE INTO users (telegram_id, username, first_name, last_name) VALUES (?, ?, ?, ?)`,
    [user.id, user.username || null, user.first_name, user.last_name || null]
  );
  // Update existing
  db.run(
    `UPDATE users SET username = COALESCE(?, username), first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name) WHERE telegram_id = ?`,
    [user.username || null, user.first_name, user.last_name || null, user.id]
  );
  const result = db.exec(`SELECT id FROM users WHERE telegram_id = ${user.id}`);
  saveDB();
  return result[0].values[0][0] as number;
}

export async function telegramAuth(req: Request, res: Response, next: NextFunction) {
  if (config.skipTelegramAuth) {
    const db = getDB();
    db.run(`INSERT OR IGNORE INTO users (telegram_id, username, first_name) VALUES (100002, 'dev_user', 'Dev')`);
    const result = db.exec('SELECT id FROM users WHERE telegram_id = 100002');
    req.telegramUser = { id: 100002, first_name: 'Dev', username: 'dev_user' };
    req.dbUserId = result[0].values[0][0] as number;
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('tma ')) {
    return res.status(401).json({ error: 'Missing Telegram authorization' });
  }

  const initData = authHeader.slice(4);
  const user = validateInitData(initData);
  if (!user) {
    return res.status(401).json({ error: 'Invalid Telegram authorization' });
  }

  req.telegramUser = user;
  req.dbUserId = upsertUser(user);
  next();
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('tma ')) {
    if (config.skipTelegramAuth) {
      const db = getDB();
      db.run(`INSERT OR IGNORE INTO users (telegram_id, username, first_name) VALUES (100002, 'dev_user', 'Dev')`);
      const result = db.exec('SELECT id FROM users WHERE telegram_id = 100002');
      req.telegramUser = { id: 100002, first_name: 'Dev', username: 'dev_user' };
      req.dbUserId = result[0].values[0][0] as number;
    }
    return next();
  }
  return telegramAuth(req, res, next);
}

export async function adminAuth(req: Request, res: Response, next: NextFunction) {
  await telegramAuth(req, res, () => {
    if (!req.dbUserId) return res.status(401).json({ error: 'Unauthorized' });
    const db = getDB();
    const result = db.exec(`SELECT is_admin FROM users WHERE id = ${req.dbUserId}`);
    if (!result.length || !result[0].values[0][0]) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}
