import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import { db } from '../config/db';
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
  const stmt = db.prepare(
    `INSERT INTO users (telegram_id, username, first_name, last_name)
     VALUES (?, ?, ?, ?)
     ON CONFLICT (telegram_id) DO UPDATE SET
       username = COALESCE(excluded.username, users.username),
       first_name = COALESCE(excluded.first_name, users.first_name),
       last_name = COALESCE(excluded.last_name, users.last_name)
     RETURNING id`
  );
  const result = stmt.get(user.id, user.username, user.first_name, user.last_name) as { id: number };
  return result.id;
}

export async function telegramAuth(req: Request, res: Response, next: NextFunction) {
  if (config.skipTelegramAuth) {
    // Ensure dev user exists
    db.prepare(
      `INSERT OR IGNORE INTO users (telegram_id, username, first_name) VALUES (100002, 'dev_user', 'Dev')`
    ).run();
    const devUser = db.prepare('SELECT id FROM users WHERE telegram_id = 100002').get() as { id: number };
    req.telegramUser = { id: 100002, first_name: 'Dev', username: 'dev_user' };
    req.dbUserId = devUser.id;
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
      db.prepare(
        `INSERT OR IGNORE INTO users (telegram_id, username, first_name) VALUES (100002, 'dev_user', 'Dev')`
      ).run();
      const devUser = db.prepare('SELECT id FROM users WHERE telegram_id = 100002').get() as { id: number };
      req.telegramUser = { id: 100002, first_name: 'Dev', username: 'dev_user' };
      req.dbUserId = devUser.id;
    }
    return next();
  }
  return telegramAuth(req, res, next);
}

export async function adminAuth(req: Request, res: Response, next: NextFunction) {
  await telegramAuth(req, res, () => {
    if (!req.dbUserId) return res.status(401).json({ error: 'Unauthorized' });
    const result = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(req.dbUserId) as { is_admin: number } | undefined;
    if (!result?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}
