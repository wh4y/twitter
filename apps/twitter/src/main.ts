import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const configService = await app.get<ConfigService>(ConfigService);
  const PORT = configService.get<number>('TWITTER_APP_PORT');

  await app.listen(PORT);
}

bootstrap();
