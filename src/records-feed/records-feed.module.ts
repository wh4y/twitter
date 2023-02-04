import { Module } from '@nestjs/common';

import { CommentModule } from '../comment/comment.module';
import { QuoteModule } from '../quote/quote.module';
import { RetweetModule } from '../retweet/retweet.module';
import { TweetModule } from '../tweet/tweet.module';
import { UserFollowingsModule } from '../user-followings/user-followings.module';

import { RecordsFeedController } from './controllers/records-feed.controller';
import { RecordsFeedService } from './services/records-feed.service';

@Module({
  controllers: [RecordsFeedController],
  imports: [TweetModule, RetweetModule, QuoteModule, CommentModule, UserFollowingsModule],
  providers: [RecordsFeedService],
})
export class RecordsFeedModule {}
