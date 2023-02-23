import { Controller, Delete, Get, Param, Post, Query, UseFilters, UseGuards } from '@nestjs/common';

import { AuthGuard } from 'common/auth';
import { CurrentUser } from 'common/auth/decorator/current-user.decorator';

import { User } from '../../users/entities/user.entity';
import { UserNotExistExceptionFilter } from '../../users/exception-filters/user-not-exist.exception-filter';
import { UserFollowing } from '../entities/user-following.entity';
import { FollowUserExceptionFilter } from '../exception-filters/follow-user.exception-filter';
import { UserFollowingsService } from '../services/user-followings.service';

@UseFilters(UserNotExistExceptionFilter)
@Controller('/user-followings')
export class UserFollowingsController {
  constructor(private readonly userFollowingsService: UserFollowingsService) {}

  @UseFilters(FollowUserExceptionFilter)
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

  @Get('/check')
  public async checkIfUsersFollowersOfEachOther(
    @Query() queries: { firstUserId: string; secondUserId: string },
  ): Promise<{ result: boolean }> {
    const result = await this.userFollowingsService.areBothUsersFollowersOfEachOther(queries.firstUserId, queries.secondUserId);

    return { result };
  }
}
