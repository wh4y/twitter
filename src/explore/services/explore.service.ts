import { Injectable } from '@nestjs/common';

import { Paginated, PaginationOptions } from 'common/pagination';
import { SortDirection } from 'common/sort';

import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { RecordsSortType } from '../../twitter-record/enums/records-sort-type.enum';
import { FindRecordsService } from '../../twitter-record/services/find-records.service';
import { UserProfile } from '../../user-profile/entities/user-profile.entity';
import { UserProfilesSortType } from '../../user-profile/enums/user-profiles-sort-type.enum';
import { UserProfileService } from '../../user-profile/services/user-profile.service';
import { User } from '../../users/entities/user.entity';
import { ExploreRecordsCategory } from '../enums/explore-records-category';

@Injectable()
export class ExploreService {
  constructor(private readonly findRecordsService: FindRecordsService, private readonly userProfileService: UserProfileService) {}

  public async getMostPopularUsers(paginationOptions: PaginationOptions): Promise<Paginated<UserProfile>> {
    return this.userProfileService.getAllUserProfiles(paginationOptions, {
      type: UserProfilesSortType.FOLLOWERS_COUNT,
      direction: SortDirection.DESC,
    });
  }

  public async getRecords(
    category: ExploreRecordsCategory,
    paginationOptions: PaginationOptions,
    currentUser: User,
  ): Promise<Paginated<TwitterRecord>> {
    let records: Paginated<TwitterRecord> = null;

    if (category === ExploreRecordsCategory.LATEST) {
      records = await this.getLatestRecords(paginationOptions, currentUser);
    }

    if (category === ExploreRecordsCategory.TOP) {
      records = await this.getMostPopularRecords(paginationOptions, currentUser);
    }

    if (category === ExploreRecordsCategory.PHOTO) {
      records = await this.getOnlyRecordsWithImages(paginationOptions, currentUser);
    }

    return records;
  }

  private async getLatestRecords(paginationOptions: PaginationOptions, currentUser: User): Promise<Paginated<TwitterRecord>> {
    return this.findRecordsService.getAllRecords(
      { excludeComments: true, onlyWithMedia: false },
      paginationOptions,
      { type: RecordsSortType.CREATION_DATETIME, direction: SortDirection.DESC },
      currentUser,
    );
  }

  private async getMostPopularRecords(paginationOptions: PaginationOptions, currentUser: User): Promise<Paginated<TwitterRecord>> {
    return this.findRecordsService.getAllRecords(
      { excludeComments: true, onlyWithMedia: false },
      paginationOptions,
      { type: RecordsSortType.LIKES_COUNT, direction: SortDirection.DESC },
      currentUser,
    );
  }

  private async getOnlyRecordsWithImages(paginationOptions: PaginationOptions, currentUser: User): Promise<Paginated<TwitterRecord>> {
    return this.findRecordsService.getAllRecords(
      { excludeComments: true, onlyWithMedia: true },
      paginationOptions,
      { type: RecordsSortType.CREATION_DATETIME, direction: SortDirection.DESC },
      currentUser,
    );
  }
}
