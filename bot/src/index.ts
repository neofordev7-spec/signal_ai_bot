import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';
import { createBot } from './bot';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const botToken = process.env.BOT_TOKEN;
const webappUrl = process.env.WEBAPP_URL;
const databaseUrl = process.env.DATABASE_URL;

if (!botToken) {
  console.error('BOT_TOKEN is required');
  process.exit(1);
}
if (!webappUrl) {
  console.error('WEBAPP_URL is required');
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });

const bot = createBot(botToken, webappUrl, pool);

bot.launch().then(() => {
  console.log('SignalAI Bot is running!');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
