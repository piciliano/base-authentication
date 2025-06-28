import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { env } from './config/env';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const port = env.PORT || 3001;
  await app.listen(port);
  Logger.log(`🚀 App rodando em http://localhost:${port}`);
}
bootstrap();
