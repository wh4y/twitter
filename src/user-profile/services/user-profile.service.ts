import { Injectable } from '@nestjs/common';

import { Paginated, PaginationOptions } from 'common/pagination';
import { SortDirection, SortOptions } from 'common/sort';

import { RecordLikesService } from '../../record-likes/services/record-likes.service';
import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { RecordsSortType } from '../../twitter-record/enums/records-sort-type.enum';
import { FindRecordsService } from '../../twitter-record/services/find-records.service';
import { User } from '../../users/entities/user.entity';
import { UserProfile } from '../entities/user-profile.entity';
import { UserProfileRecordsFiltrationType } from '../enums/user-profile-records-filtration-type.enum';
import { UserProfilesSortType } from '../enums/user-profiles-sort-type.enum';
import { UserProfileRepository } from '../repository/user-profile.repository';

@Injectable()
export class UserProfileService {
  constructor(
    private readonly findRecordsService: FindRecordsService,
    private readonly recordLikesService: RecordLikesService,
    private readonly userProfileRepository: UserProfileRepository,
  ) {}

  public async createProfileFor({ id: userId }: User): Promise<void> {
    const profile = new UserProfile({ userId });

    await this.userProfileRepository.save(profile);
  }

  public async getUserProfile(userId: string): Promise<UserProfile> {
    return this.userProfileRepository.findProfileByUserIdOrThrow(userId);
  }

  public async getAllUserProfiles(
    paginationOptions: PaginationOptions,
    sortOptions: SortOptions<UserProfilesSortType>,
  ): Promise<Paginated<UserProfile>> {
    return this.userProfileRepository.findManyProfiles(paginationOptions, sortOptions);
  }

  public async getUserRecords(
    userId: string,
    filtrationType: UserProfileRecordsFiltrationType,
    paginationOptions: PaginationOptions,
    currentUser: User,
  ): Promise<Paginated<TwitterRecord>> {
    let records: Paginated<TwitterRecord> = null;

    if (filtrationType === UserProfileRecordsFiltrationType.TWEETS) {
      records = await this.getUserRecordsExceptComments(userId, paginationOptions, currentUser);
    }

    if (filtrationType === UserProfileRecordsFiltrationType.TWEETS_AND_REPLIES) {
      records = await this.getAllUserRecords(userId, paginationOptions, currentUser);
    }

    if (filtrationType === UserProfileRecordsFiltrationType.ONLY_WITH_MEDIA) {
      records = await this.getOnlyUserRecordsWithMedia(userId, paginationOptions, currentUser);
    }

    if (filtrationType === UserProfileRecordsFiltrationType.LIKES) {
      records = await this.getRecordsLikedByUser(userId, paginationOptions, currentUser);
    }

    return records;
  }

  private async getAllUserRecords(
    userId: string,
    paginationOptions: PaginationOptions,
    currentUser: User,
  ): Promise<Paginated<TwitterRecord>> {
    return this.findRecordsService.getRecordsByAuthorId(
      userId,
      { excludeComments: false, onlyWithMedia: false },
      paginationOptions,
      { type: RecordsSortType.CREATION_DATETIME, direction: SortDirection.DESC },
      currentUser,
    );
  }

  private async getUserRecordsExceptComments(
    userId: string,
    paginationOptions: PaginationOptions,
    currentUser: User,
  ): Promise<Paginated<TwitterRecord>> {
    return this.findRecordsService.getRecordsByAuthorId(
      userId,
      { excludeComments: true, onlyWithMedia: false },
      paginationOptions,
      { type: RecordsSortType.CREATION_DATETIME, direction: SortDirection.DESC },
      currentUser,
    );
  }

  private async getOnlyUserRecordsWithMedia(
    userId: string,
    paginationOptions: PaginationOptions,
    currentUser: User,
  ): Promise<Paginated<TwitterRecord>> {
    return this.findRecordsService.getRecordsByAuthorId(
      userId,
      { excludeComments: false, onlyWithMedia: true },
      paginationOptions,
      { type: RecordsSortType.CREATION_DATETIME, direction: SortDirection.DESC },
      currentUser,
    );
  }

  private async getRecordsLikedByUser(
    userId: string,
    paginationOptions: PaginationOptions,
    currentUser: User,
  ): Promise<Paginated<TwitterRecord>> {
    const { data: likes } = await this.recordLikesService.getUserLikes(userId, paginationOptions);

    const likedRecordIds = likes.map((like) => like.recordId);

    return this.findRecordsService.getRecordsByIds(
      likedRecordIds,
      { onlyWithMedia: false, excludeComments: false },
      paginationOptions,
      { type: RecordsSortType.CREATION_DATETIME, direction: SortDirection.DESC },
      currentUser,
    );
  }
}
