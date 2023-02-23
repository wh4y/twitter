import { Module } from '@nestjs/common';

import { UserFollowingsService } from './services/user-followings.service';

@Module({
  providers: [UserFollowingsService],
  exports: [UserFollowingsService],
})
export class UserFollowingsExternalModule {}
