import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const BOT_TOKEN = process.env.BOT_TOKEN || '';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface AuthRequest extends Request {
  telegramUser?: TelegramUser;
}

export function validateTelegramData(initData: string): TelegramUser | null {
  if (!initData) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;

  params.delete('hash');
  const dataCheckArr = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => `${key}=${val}`);
  const dataCheckString = dataCheckArr.join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (computedHash !== hash) return null;

  const userStr = params.get('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as TelegramUser;
  } catch {
    return null;
  }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === 'development') {
    req.telegramUser = { id: 123456, first_name: 'Dev' };
    return next();
  }

  const initData = req.headers['x-telegram-init-data'] as string;

  if (!initData) {
    return res.status(401).json({ error: 'No auth data' });
  }

  const user = validateTelegramData(initData);
  if (!user) {
    return res.status(401).json({ error: 'Invalid auth data' });
  }

  req.telegramUser = user;
  next();
}
