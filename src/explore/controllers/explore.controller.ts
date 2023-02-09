import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { AuthGuard } from 'common/auth';
import { CurrentUser } from 'common/auth/decorator/current-user.decorator';
import { Paginated, PaginationOptions } from 'common/pagination';

import { RecordPaginationOptions } from '../../twitter-record/decorators/record-pagination-options.decorator';
import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { UserProfile } from '../../user-profile/entities/user-profile.entity';
import { User } from '../../users/entities/user.entity';
import { ExploreRecordsCategory } from '../enums/explore-records-category';
import { ExploreService } from '../services/explore.service';

@Controller('/explore')
export class ExploreController {
  constructor(private readonly exploreService: ExploreService) {}

  @UseGuards(AuthGuard)
  @Get('/records')
  public async exploreRecords(
    @Query('exploreRecordsCategory') category: ExploreRecordsCategory,
    @RecordPaginationOptions() paginationOptions: PaginationOptions,
    @CurrentUser() currentUser: User,
  ): Promise<Paginated<TwitterRecord>> {
    return this.exploreService.getRecords(category, paginationOptions, currentUser);
  }

  @UseGuards(AuthGuard)
  @Get('/users')
  public async exploreUsers(@RecordPaginationOptions() paginationOptions: PaginationOptions): Promise<Paginated<UserProfile>> {
    return this.exploreService.getMostPopularUsers(paginationOptions);
  }
}
