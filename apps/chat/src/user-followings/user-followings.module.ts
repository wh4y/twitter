import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserFollowing } from './entities/user-following.entity';
import { UserFollowingRepository } from './repositories/user-following.repository';
import { UserFollowingsService } from './services/user-followings.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserFollowing])],
  providers: [UserFollowingsService, UserFollowingRepository],
  exports: [UserFollowingsService],
})
export class UserFollowingsModule {}
