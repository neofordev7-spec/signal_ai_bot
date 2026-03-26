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
        `🧠 *SignalAI* — bu sun'iy intellekt yordamida shahardagi muammolarni aniqlash va tahlil qilish uchun yaratilgan platformadir.\n\n` +
        `🎯 *Nima qila olasiz?*\n\n` +
        `📝 Shahardagi muammoni xabar bering — yo'l chuqurlari, elektr uzilishi, suv muammosi va boshqalar\n` +
        `🤖 AI avtomatik ravishda muammoni tahlil qiladi — kategoriya, dolzarblik va sentiment aniqlaydi\n` +
        `👀 Boshqa odamlar yuborgan muammolarni ko'ring\n` +
        `👍 Eng muhim muammolarga ovoz bering — tashkilotlar e'tibor bersin!\n` +
        `📊 Analitika dashboardida eng ko'p uchraydigan muammolarni kuzating\n\n` +
        `🏆 _SolveIt Hackathon — Toshkent loyihasi_\n\n` +
        `Boshlash uchun pastdagi tugmani bosing 👇`,
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

    bot.catch((err: any) => {
      console.error('Bot error:', err);
    });

    bot.launch()
      .then(() => console.log('SignalAI Bot is running!'))
      .catch((err) => console.error('Bot launch failed:', err));

    process.once('SIGINT', () => { saveDB(); bot.stop('SIGINT'); });
    process.once('SIGTERM', () => { saveDB(); bot.stop('SIGTERM'); });
  } else {
    console.warn('BOT_TOKEN not set, bot is disabled');
  }

  console.log('BOT_TOKEN:', config.botToken ? 'SET (' + config.botToken.slice(0, 5) + '...)' : 'NOT SET');
  console.log('WEBAPP_URL:', config.webappUrl);
}

start().catch((err) => {
  console.error('FATAL start error:', err);
  process.exit(1);
});
