import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { RedisModule } from '@nestjs-modules/ioredis';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';

import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './auth/middleware/auth.middleware';
import { CommentModule } from './comment/comment.module';
import { CommentController } from './comment/controllers/comment.controller';
import { QuoteController } from './quote/controllers/quote.controller';
import { QuoteModule } from './quote/quote.module';
import { RecordLikesController } from './record-likes/controllers/record-likes.controller';
import { RecordLikesModule } from './record-likes/record-likes.module';
import { RecordsPrivacyController } from './record-privacy/controllers/records-privacy.controller';
import { RecordsExploreModule } from './records-explore/records-explore.module';
import { RecordsFeedController } from './records-feed/controllers/records-feed.controller';
import { RecordsFeedModule } from './records-feed/records-feed.module';
import { RetweetController } from './retweet/controllers/retweet.controller';
import { RetweetModule } from './retweet/retweet.module';
import { TweetController } from './tweet/controllers/tweet.controller';
import { TweetModule } from './tweet/tweet.module';
import { UserPrivacyController } from './user-privacy/controllers/user-privacy.controller';
import { UserProfileController } from './user-profile/controllers/user-profile.controller';
import { UserProfileModule } from './user-profile/user-profile.module';

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
    TweetModule,
    CommentModule,
    RetweetModule,
    QuoteModule,
    UserProfileModule,
    RecordLikesModule,
    RecordsFeedModule,
    RecordsExploreModule,
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'auth/sign-out', method: RequestMethod.DELETE },
        { path: 'session/all', method: RequestMethod.GET },
        { path: 'session/all', method: RequestMethod.DELETE },
        { path: 'session/:sessionId', method: RequestMethod.DELETE },
        TweetController,
        CommentController,
        RetweetController,
        QuoteController,
        RecordsPrivacyController,
        UserProfileController,
        { path: 'user-followings/*', method: RequestMethod.POST },
        { path: 'user-followings/*', method: RequestMethod.DELETE },
        UserPrivacyController,
        RecordLikesController,
        RecordsFeedController,
      );
  }
}
