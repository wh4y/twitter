import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { RedisModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';

import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: configService.get<string>('DB_DIALECT'),
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USER'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
          logging: true,
          entities: [path.join(__dirname, '**', 'entities', '*.{ts,js}')],
        } as TypeOrmModuleOptions;
      },
    }),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        config: {
          url: configService.get<string>('REDIS_URL'),
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
})
export class AppModule {}
