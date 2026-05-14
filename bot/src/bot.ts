import { Bot, InlineKeyboard } from 'grammy';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const WEBAPP_URL = process.env.WEBAPP_URL || 'http://localhost:5173';
const ADMIN_USER_ID = Number(process.env.ADMIN_USER_ID) || 0;

export function createBot() {
  const bot = new Bot(BOT_TOKEN);

  bot.command('start', async (ctx) => {
    const keyboard = new InlineKeyboard()
      .webApp('💅 Записаться', WEBAPP_URL);

    await ctx.reply(
      '✨ Добро пожаловать в салон маникюра!\n\n' +
      'Здесь вы можете:\n' +
      '• Выбрать услугу\n' +
      '• Выбрать удобное время\n' +
      '• Записаться онлайн\n\n' +
      'Нажмите кнопку ниже, чтобы открыть запись 👇',
      { reply_markup: keyboard }
    );
  });

  bot.command('mybookings', async (ctx) => {
    const keyboard = new InlineKeyboard()
      .webApp('📋 Мои записи', `${WEBAPP_URL}/#/my-bookings`);

    await ctx.reply('Нажмите, чтобы посмотреть ваши записи:', {
      reply_markup: keyboard,
    });
  });

  bot.command('admin', async (ctx) => {
    if (ctx.from?.id !== ADMIN_USER_ID) {
      return ctx.reply('⛔ Доступ запрещён');
    }

    const keyboard = new InlineKeyboard()
      .webApp('🔧 Админ-панель', `${WEBAPP_URL}/#/admin`);

    await ctx.reply('Панель управления:', {
      reply_markup: keyboard,
    });
  });

  bot.catch((err) => {
    console.error('Bot error:', err);
  });

  return bot;
}

export async function notifyAdmin(bot: Bot, message: string) {
  if (ADMIN_USER_ID) {
    try {
      await bot.api.sendMessage(ADMIN_USER_ID, message, { parse_mode: 'HTML' });
    } catch (e) {
      console.error('Failed to notify admin:', e);
    }
  }
}
