import { Injectable } from '@nestjs/common';

import { Paginated, PaginationOptions } from 'common/pagination';
import { SortOptions } from 'common/sort';

import { RecordLikesService } from '../../record-likes/services/record-likes.service';
import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { RecordsSortType } from '../../twitter-record/enums/records-sort-type.enum';
import { FindRecordsService } from '../../twitter-record/services/find-records.service';
import { User } from '../../users/entities/user.entity';
import { UserProfileRecordsFiltrationType } from '../enums/user-profile-records-filtration-type.enum';

@Injectable()
export class UserProfileService {
  constructor(private readonly findRecordsService: FindRecordsService, private readonly recordLikesService: RecordLikesService) {}

  public async getUserRecords(
    userId: string,
    filtrationType: UserProfileRecordsFiltrationType,
    paginationOptions: PaginationOptions,
    sortOptions: SortOptions<RecordsSortType>,
    currentUser: User,
  ): Promise<Paginated<TwitterRecord>> {
    let records: Paginated<TwitterRecord> = null;

    if (filtrationType === UserProfileRecordsFiltrationType.TWEETS) {
      records = await this.getUserRecordsExceptComments(userId, paginationOptions, sortOptions, currentUser);
    }

    if (filtrationType === UserProfileRecordsFiltrationType.TWEETS_AND_REPLIES) {
      records = await this.getAllUserRecords(userId, paginationOptions, sortOptions, currentUser);
    }

    if (filtrationType === UserProfileRecordsFiltrationType.ONLY_WITH_MEDIA) {
      records = await this.getOnlyUserRecordsWithMedia(userId, paginationOptions, sortOptions, currentUser);
    }

    if (filtrationType === UserProfileRecordsFiltrationType.LIKES) {
      records = await this.getRecordsLikedByUser(userId, paginationOptions, sortOptions, currentUser);
    }

    return records;
  }

  private async getAllUserRecords(
    userId: string,
    paginationOptions: PaginationOptions,
    sortOptions: SortOptions<RecordsSortType>,
    currentUser: User,
  ): Promise<Paginated<TwitterRecord>> {
    return this.findRecordsService.getRecordsByAuthorId(
      userId,
      { excludeComments: false, onlyWithMedia: false },
      paginationOptions,
      sortOptions,
      currentUser,
    );
  }

  private async getUserRecordsExceptComments(
    userId: string,
    paginationOptions: PaginationOptions,
    sortOptions: SortOptions<RecordsSortType>,
    currentUser: User,
  ): Promise<Paginated<TwitterRecord>> {
    return this.findRecordsService.getRecordsByAuthorId(
      userId,
      { excludeComments: true, onlyWithMedia: false },
      paginationOptions,
      sortOptions,
      currentUser,
    );
  }

  private async getOnlyUserRecordsWithMedia(
    userId: string,
    paginationOptions: PaginationOptions,
    sortOptions: SortOptions<RecordsSortType>,
    currentUser: User,
  ): Promise<Paginated<TwitterRecord>> {
    return this.findRecordsService.getRecordsByAuthorId(
      userId,
      { excludeComments: false, onlyWithMedia: true },
      paginationOptions,
      sortOptions,
      currentUser,
    );
  }

  private async getRecordsLikedByUser(
    userId: string,
    paginationOptions: PaginationOptions,
    sortOptions: SortOptions<RecordsSortType>,
    currentUser: User,
  ): Promise<Paginated<TwitterRecord>> {
    const { data: likes } = await this.recordLikesService.getUserLikes(userId, paginationOptions);

    const likedRecordIds = likes.map((like) => like.recordId);

    return this.findRecordsService.getRecordsByIds(
      likedRecordIds,
      { onlyWithMedia: false, excludeComments: false },
      paginationOptions,
      sortOptions,
      currentUser,
    );
  }
}
