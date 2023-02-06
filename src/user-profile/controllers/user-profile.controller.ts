import { ClassSerializerInterceptor, Controller, Get, Param, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';

import { AuthGuard } from 'common/auth';
import { CurrentUser } from 'common/auth/decorator/current-user.decorator';

import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { UserFollowing } from '../../user-followings/entities/user-following.entity';
import { UserFollowingsService } from '../../user-followings/services/user-followings.service';
import { User } from '../../users/entities/user.entity';
import { UserNotExistExceptionFilter } from '../../users/exception-filters/user-not-exist.exception-filter';
import { UserProfileService } from '../services/user-profile.service';

@UseFilters(UserNotExistExceptionFilter)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('/user-profile')
export class UserProfileController {
  constructor(
    private readonly userProfileService: UserProfileService,
    private readonly userFollowingsService: UserFollowingsService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('/:userId/records')
  public async getUserRecords(@Param('userId') userId: string, @CurrentUser() currentUser: User): Promise<TwitterRecord[]> {
    return this.userProfileService.getUserRecordsSortedByDate(userId, currentUser);
  }

  @Get('/:userId/followers')
  public async getUserFollowers(@Param('userId') userId: string): Promise<UserFollowing[]> {
    return this.userFollowingsService.getUserFollowers(userId);
  }

  @Get('/:userId/followings')
  public async getUserFollowings(@Param('userId') userId: string): Promise<UserFollowing[]> {
    return this.userFollowingsService.getUserFollowings(userId);
  }
}
