import './env';
import { createBot } from './bot';

async function main() {
  const bot = createBot();

  console.log('Bot starting...');
  await bot.start({
    onStart: () => console.log('Bot is running!'),
  });
}

main().catch(console.error);
