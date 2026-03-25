import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  dbPath: process.env.DB_PATH || path.resolve(__dirname, '../../../data/signalai.db'),
  botToken: process.env.BOT_TOKEN || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  skipTelegramAuth: process.env.SKIP_TELEGRAM_AUTH === 'true',
  webappUrl: process.env.WEBAPP_URL || 'http://localhost:3000',
  uploadDir: path.resolve(__dirname, '../../uploads'),
};
