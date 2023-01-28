import { Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';

import { AuthGuard } from 'common/auth';
import { CurrentUser } from 'common/auth/decorator/current-user.decorator';

import { User } from '../../users/entities/user.entity';
import { UserFollowing } from '../entities/user-following.entity';
import { UserFollowingsService } from '../services/user-followings.service';

@Controller('/user-followings')
export class UserFollowingsController {
  constructor(private readonly userFollowingsService: UserFollowingsService) {}

  @UseGuards(AuthGuard)
  @Post('/follow/:userId')
  public async followUser(@Param('userId') userId: string, @CurrentUser() currentUser: User): Promise<UserFollowing> {
    return this.userFollowingsService.followUser(userId, currentUser);
  }

  @UseGuards(AuthGuard)
  @Delete('/unfollow/:userId')
  public async unfollowUser(@Param('userId') userId: string, @CurrentUser() currentUser: User): Promise<void> {
    return this.userFollowingsService.unfollowUser(userId, currentUser);
  }
}
