import { Module } from '@nestjs/common';

import { RetweetModule } from '../retweet/retweet.module';
import { TweetModule } from '../tweet/tweet.module';
import { UserFollowingsModule } from '../user-followings/user-followings.module';

import { UserProfileController } from './controllers/user-profile.controller';
import { UserProfileService } from './services/user-profile.service';

@Module({
  controllers: [UserProfileController],
  imports: [TweetModule, RetweetModule, UserFollowingsModule],
  providers: [UserProfileService],
})
export class UserProfileModule {}
