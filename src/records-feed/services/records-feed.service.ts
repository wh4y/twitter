import { Injectable } from '@nestjs/common';

import { Paginated, PaginationOptions } from 'common/pagination';
import { SortDirection } from 'common/sort';

import { RecordPermissionsService } from '../../record-permissions/services/record-permissions.service';
import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { RecordsSortType } from '../../twitter-record/enums/records-sort-type.enum';
import { FindRecordsService } from '../../twitter-record/services/find-records.service';
import { UserFollowingsService } from '../../user-followings/services/user-followings.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class RecordsFeedService {
  constructor(
    private readonly findRecordsService: FindRecordsService,
    private readonly recordPermissionsService: RecordPermissionsService,
    private readonly userFollowingsService: UserFollowingsService,
  ) {}

  public async getRecordsOfUsersFollowedByCurrentUser(
    currentUser: User,
    paginationOptions: PaginationOptions,
  ): Promise<Paginated<TwitterRecord>> {
    const followings = await this.userFollowingsService.getUserFollowings(currentUser.id);

    const followedUsersIds = followings.map((following) => following.followedUserId);

    return this.findRecordsService.getRecordsByAuthorIds(
      followedUsersIds,
      { excludeComments: false, onlyWithMedia: false },
      paginationOptions,
      { type: RecordsSortType.CREATION_DATETIME, direction: SortDirection.DESC },
      currentUser,
    );
  }
}
