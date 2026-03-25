import app from './app';
import { config } from './config/env';

app.listen(config.port, () => {
  console.log(`SignalAI Backend running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Telegram auth: ${config.skipTelegramAuth ? 'SKIPPED (dev mode)' : 'enabled'}`);
});
