import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { TwitterRecordModule } from '../twitter-record/twitter-record.module';

import { TweetController } from './controllers/tweet.controller';
import { TweetMappingProfile } from './mappers/tweet.mapping-profile';
import { TweetService } from './services/tweet.service';

@Module({
  controllers: [TweetController],
  imports: [
    TwitterRecordModule,
    ServeStaticModule.forRoot({
      rootPath: './upload',
      serveRoot: '/tweet',
      serveStaticOptions: {
        index: false,
      },
    }),
  ],
  providers: [TweetService, TweetMappingProfile],
})
export class TweetModule {}
