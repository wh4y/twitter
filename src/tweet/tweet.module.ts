import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { TwitterRecordModule } from '../twitter-record/twitter-record.module';

import { TWEET_IMAGES_DESTINATION } from './constants/tweet-images-destination.constant';
import { TweetController } from './controllers/tweet.controller';
import { TweetService } from './services/tweet.service';

@Module({
  controllers: [TweetController],
  imports: [
    TwitterRecordModule,
    ServeStaticModule.forRoot({
      rootPath: './upload',
      serveRoot: TWEET_IMAGES_DESTINATION,
      serveStaticOptions: {
        index: false,
      },
    }),
  ],
  providers: [TweetService],
  exports: [TweetService],
})
export class TweetModule {}
