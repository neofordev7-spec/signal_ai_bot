import app from './app';
import { config } from './config/env';
import { initDB, getDB, saveDB } from './config/db';
import { Telegraf, Markup } from 'telegraf';

async function start() {
  // Init database first
  await initDB();

  // --- Express Server ---
  app.listen(config.port, () => {
    console.log(`SignalAI Backend running on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Telegram auth: ${config.skipTelegramAuth ? 'SKIPPED (dev mode)' : 'enabled'}`);
  });

  // --- Telegram Bot ---
  if (config.botToken) {
    const bot = new Telegraf(config.botToken);

    bot.command('start', async (ctx) => {
      const tgUser = ctx.from;
      try {
        const db = getDB();
        db.run(`INSERT OR IGNORE INTO users (telegram_id, username, first_name, last_name) VALUES (?, ?, ?, ?)`,
          [tgUser.id, tgUser.username || null, tgUser.first_name, tgUser.last_name || null]);
        db.run(`UPDATE users SET username = COALESCE(?, username), first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name) WHERE telegram_id = ?`,
          [tgUser.username || null, tgUser.first_name, tgUser.last_name || null, tgUser.id]);
        saveDB();
      } catch (err) {
        console.error('Failed to upsert user:', err);
      }

      await ctx.reply(
        `Assalomu alaykum, ${tgUser.first_name}! 👋\n\n` +
        `🔍 *SignalAI* — shahardagi muammolarni xabar bering!\n\n` +
        `📝 Muammo yuboring\n` +
        `👀 Boshqalar muammosini ko'ring\n` +
        `👍 Ovoz bering\n\n` +
        `Ilovani ochish uchun pastdagi tugmani bosing 👇`,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.webApp('🚀 Ilovani ochish', config.webappUrl)],
          ]),
        }
      );
    });

    bot.command('help', async (ctx) => {
      await ctx.reply(
        `📖 *SignalAI yordam*\n\n` +
        `/start — Ilovani boshlash\n` +
        `/help — Yordam\n\n` +
        `Ilova orqali siz:\n` +
        `• Muammo yuborishingiz\n` +
        `• Muammolarga ovoz berishingiz\n` +
        `• Trending muammolarni ko'rishingiz mumkin`,
        { parse_mode: 'Markdown' }
      );
    });

    bot.launch().then(() => {
      console.log('SignalAI Bot is running!');
    });

    process.once('SIGINT', () => { saveDB(); bot.stop('SIGINT'); });
    process.once('SIGTERM', () => { saveDB(); bot.stop('SIGTERM'); });
  } else {
    console.warn('BOT_TOKEN not set, bot is disabled');
  }
}

start().catch(console.error);
