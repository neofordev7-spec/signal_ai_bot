import { Telegraf, Markup } from 'telegraf';
import Database from 'better-sqlite3';

export function createBot(token: string, webappUrl: string, db: Database.Database) {
  const bot = new Telegraf(token);

  bot.command('start', async (ctx) => {
    const tgUser = ctx.from;

    try {
      db.prepare(
        `INSERT INTO users (telegram_id, username, first_name, last_name)
         VALUES (?, ?, ?, ?)
         ON CONFLICT (telegram_id) DO UPDATE SET
           username = COALESCE(excluded.username, users.username),
           first_name = COALESCE(excluded.first_name, users.first_name),
           last_name = COALESCE(excluded.last_name, users.last_name)`
      ).run(tgUser.id, tgUser.username, tgUser.first_name, tgUser.last_name);
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
          [Markup.button.webApp('🚀 Ilovani ochish', webappUrl)],
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

  return bot;
}
