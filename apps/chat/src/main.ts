import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';

import { WebsocketAdapter } from 'common/ws';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    allowedHeaders: ['origin', 'x-requested-with', 'content-type', 'accept', 'authorization'],
    credentials: true,
    origin: 'http://localhost:3000',
  });
  app.use(cookieParser());
  app.useWebSocketAdapter(new WebsocketAdapter(app));

  const configService = app.get<ConfigService>(ConfigService);

  const PORT = configService.get<number>('CHAT_APP_PORT');

  await app.listen(PORT);
}
bootstrap();
