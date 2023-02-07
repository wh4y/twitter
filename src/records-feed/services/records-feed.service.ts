import { Injectable } from '@nestjs/common';

import { asyncFilter } from 'common/array-utils';
import { Paginated, PaginationOptions } from 'common/pagination';
import { SortOptions } from 'common/sort';

import { RecordPermissionsService } from '../../record-permissions/services/record-permissions.service';
import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { RecordsSortType } from '../../twitter-record/enums/records-sort-type.enum';
import { TwitterRecordRepository } from '../../twitter-record/repositories/twitter-record.repository';
import { UserFollowingsService } from '../../user-followings/services/user-followings.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class RecordsFeedService {
  constructor(
    private readonly recordRepository: TwitterRecordRepository,
    private readonly recordPermissionsService: RecordPermissionsService,
    private readonly userFollowingsService: UserFollowingsService,
  ) {}

  public async getRecordsOfFollowedUsers(
    currentUser: User,
    paginationOptions: PaginationOptions,
    sortOptions: SortOptions<RecordsSortType>,
  ): Promise<Paginated<TwitterRecord>> {
    const followings = await this.userFollowingsService.getUserFollowings(currentUser.id);

    const followedUsersIds = followings.map((following) => following.followedUserId);

    const { data: records, ...paginationMetadata } = await this.recordRepository.findRecordsByAuthorIds(
      followedUsersIds,
      paginationOptions,
      sortOptions,
    );

    const recordsAllowedToView = await asyncFilter(records, async (record) => {
      return this.recordPermissionsService.canCurrentUserViewRecord(currentUser, record);
    });

    return { data: recordsAllowedToView, ...paginationMetadata };
  }
}
