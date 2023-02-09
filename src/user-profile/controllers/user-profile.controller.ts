import { ClassSerializerInterceptor, Controller, Get, Param, Query, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';

import { AuthGuard } from 'common/auth';
import { CurrentUser } from 'common/auth/decorator/current-user.decorator';
import { Paginated, PaginationOptions } from 'common/pagination';
import { SortOptions } from 'common/sort';

import { RecordPaginationOptions } from '../../twitter-record/decorators/record-pagination-options.decorator';
import { RecordSortOptions } from '../../twitter-record/decorators/record-sort-options.decorator';
import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { RecordsSortType } from '../../twitter-record/enums/records-sort-type.enum';
import { UserFollowing } from '../../user-followings/entities/user-following.entity';
import { UserFollowingsService } from '../../user-followings/services/user-followings.service';
import { User } from '../../users/entities/user.entity';
import { UserNotExistExceptionFilter } from '../../users/exception-filters/user-not-exist.exception-filter';
import { UserProfileRecordsFiltrationType } from '../enums/user-profile-records-filtration-type.enum';
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
  public async getUserRecords(
    @Param('userId') userId: string,
    @Query('userProfileRecordsFiltrationType') filtrationType: UserProfileRecordsFiltrationType,
    @RecordPaginationOptions() paginationOptions: PaginationOptions,
    @RecordSortOptions() sortOptions: SortOptions<RecordsSortType>,
    @CurrentUser() currentUser: User,
  ): Promise<Paginated<TwitterRecord>> {
    return this.userProfileService.getUserRecords(userId, filtrationType, paginationOptions, sortOptions, currentUser);
  }

  @Get('/:userId/followers')
  public async getUserFollowers(@Param('userId') userId: string): Promise<UserFollowing[]> {
    return this.userFollowingsService.getUserFollowers(userId);
  }

  @Get('/:userId/followings')
  public async getUserFollowings(@Param('userId') userId: string): Promise<UserFollowing[]> {
    return this.userFollowingsService.getUserFollowings(userId);
  }

  @Get('/:userId/followers/count')
  public async getUserFollowersCount(@Param('userId') userId: string): Promise<number> {
    return this.userFollowingsService.getUserFollowersCount(userId);
  }

  @Get('/:userId/followings/count')
  public async getUserFollowingsCount(@Param('userId') userId: string): Promise<number> {
    return this.userFollowingsService.getUserFollowingsCount(userId);
  }
}
