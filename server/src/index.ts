import { config } from 'dotenv';
import path from 'path';
config({ path: path.join(__dirname, '..', '..', '.env') });

import express from 'express';
import cors from 'cors';
import { initDB } from './db';
import { authMiddleware } from './middleware/auth';
import servicesRouter from './routes/services';
import bookingsRouter from './routes/bookings';
import adminRouter from './routes/admin';
import { Bot, InlineKeyboard } from 'grammy';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

function startBot() {
  const token = process.env.BOT_TOKEN;
  const webappUrl = process.env.WEBAPP_URL;
  if (!token) return;

  const bot = new Bot(token);

  bot.command('start', async (ctx) => {
    const keyboard = new InlineKeyboard()
      .webApp('💅 Записаться', webappUrl!);

    await ctx.reply(
      '✨ Добро пожаловать!\n\n' +
      'Здесь вы можете записаться на маникюр:\n' +
      '• Выбрать услугу\n' +
      '• Выбрать удобное время\n' +
      '• Записаться онлайн\n\n' +
      'Нажмите кнопку ниже 👇',
      { reply_markup: keyboard }
    );
  });

  bot.command('mybookings', async (ctx) => {
    const keyboard = new InlineKeyboard()
      .webApp('📋 Мои записи', `${webappUrl}/#/my-bookings`);
    await ctx.reply('Ваши записи:', { reply_markup: keyboard });
  });

  bot.catch((err) => console.error('Bot error:', err));

  bot.start({ onStart: () => console.log('Bot is running!') });
}

async function start() {
  await initDB();

  app.use('/api/services', servicesRouter);
  app.use('/api/bookings', authMiddleware, bookingsRouter);
  app.use('/api/admin', authMiddleware, adminRouter);

  const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientDist, 'index.html'));
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  startBot();
}

start().catch(console.error);

export default app;
