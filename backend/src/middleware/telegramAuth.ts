import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import { pool } from '../config/db';
import { validateInitData, TelegramUser } from '../utils/telegram';

declare global {
  namespace Express {
    interface Request {
      telegramUser?: TelegramUser;
      dbUserId?: number;
    }
  }
}

export async function telegramAuth(req: Request, res: Response, next: NextFunction) {
  // Dev mode: skip auth
  if (config.skipTelegramAuth) {
    req.telegramUser = { id: 100002, first_name: 'Dev', username: 'dev_user' };
    req.dbUserId = 2;
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

  // Upsert user in database
  const result = await pool.query(
    `INSERT INTO users (telegram_id, username, first_name, last_name)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (telegram_id) DO UPDATE SET
       username = COALESCE(EXCLUDED.username, users.username),
       first_name = COALESCE(EXCLUDED.first_name, users.first_name),
       last_name = COALESCE(EXCLUDED.last_name, users.last_name)
     RETURNING id`,
    [user.id, user.username, user.first_name, user.last_name]
  );

  req.telegramUser = user;
  req.dbUserId = result.rows[0].id;
  next();
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('tma ')) {
    return next();
  }
  return telegramAuth(req, res, next);
}

export async function adminAuth(req: Request, res: Response, next: NextFunction) {
  await telegramAuth(req, res, async () => {
    if (!req.dbUserId) return res.status(401).json({ error: 'Unauthorized' });
    const result = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.dbUserId]);
    if (!result.rows[0]?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}
