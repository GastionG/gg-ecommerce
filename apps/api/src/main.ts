import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { log } from 'console';
import { APP_NAME } from '@gg/shared';

async function bootstrap() {
  log('Starting server...');
  log(APP_NAME);
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 4000);
}
await bootstrap();
