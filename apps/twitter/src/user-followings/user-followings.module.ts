import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '../users/users.module';

import { UserFollowingsController } from './controllers/user-followings.controller';
import { UserFollowing } from './entities/user-following.entity';
import { UserFollowingsRepository } from './repositories/user-followings.repository';
import { UserFollowingsService } from './services/user-followings.service';

@Module({
  controllers: [UserFollowingsController],
  imports: [TypeOrmModule.forFeature([UserFollowing]), UsersModule],
  providers: [UserFollowingsRepository, UserFollowingsService],
  exports: [UserFollowingsService],
})
export class UserFollowingsModule {}
