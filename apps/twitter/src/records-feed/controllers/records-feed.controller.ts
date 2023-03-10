import { ClassSerializerInterceptor, Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';

import { AuthGuard } from 'common/auth';
import { CurrentUser } from 'common/auth/decorator/current-user.decorator';
import { Paginated, PaginationOptions } from 'common/pagination';

import { RecordPaginationOptions } from '../../twitter-record/decorators/record-pagination-options.decorator';
import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { User } from '../../users/entities/user.entity';
import { RecordsFeedService } from '../services/records-feed.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('/records-feed')
export class RecordsFeedController {
  constructor(private readonly recordsFeedService: RecordsFeedService) {}

  @UseGuards(AuthGuard)
  @Get()
  public async getRecordsOfCurrentUserFollowings(
    @CurrentUser() currenUser: User,
    @RecordPaginationOptions() paginationOptions: PaginationOptions,
  ): Promise<Paginated<TwitterRecord>> {
    return this.recordsFeedService.getRecordsOfUsersFollowedByCurrentUser(currenUser, paginationOptions);
  }
}
