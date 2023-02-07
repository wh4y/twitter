import { ForbiddenError } from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { asyncFilter } from 'common/array-utils';
import { Paginated, PaginationOptions } from 'common/pagination';

import { RecordPermissionsService } from '../../record-permissions/services/record-permissions.service';
import { RecordPrivacySettings } from '../../record-privacy/entities/record-privacy-settings.entity';
import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { TwitterRecordRepository } from '../../twitter-record/repositories/twitter-record.repository';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class RetweetService {
  constructor(
    private readonly recordRepository: TwitterRecordRepository,
    private readonly recordPermissionsService: RecordPermissionsService,
  ) {}

  public async retweet(recordId: string, privacySettings: Partial<RecordPrivacySettings>, currentUser: User): Promise<TwitterRecord> {
    const recordPrivacySettings = new RecordPrivacySettings({ ...privacySettings });

    let retweetedRecordId = recordId;

    const retweet = await this.recordRepository.findRetweetById(recordId);

    if (retweet) {
      retweetedRecordId = retweet.parentRecordId;
    }

    const newRetweet = new TwitterRecord({
      authorId: currentUser.id,
      parentRecordId: retweetedRecordId,
      privacySettings: recordPrivacySettings,
    });

    await this.recordRepository.saveRetweetIfNotExistOrThrow(newRetweet);

    return newRetweet;
  }

  private async filterRetweetsByRetweetedRecordsCurrentUserAllowedToView(
    retweets: TwitterRecord[],
    currentUser: User,
  ): Promise<TwitterRecord[]> {
    const retweetsWithRetweetedRecordsAllowedToBeViewed = Promise.all(
      retweets.filter(async (retweet) => {
        const canCurrentUserViewRetweetedRecord = await this.recordPermissionsService.canCurrentUserViewRecord(
          currentUser,
          retweet.parentRecord,
        );

        return canCurrentUserViewRetweetedRecord;
      }),
    );

    return retweetsWithRetweetedRecordsAllowedToBeViewed;
  }

  public async getRetweetsByAuthorId(
    authorId: string,
    paginationOptions: PaginationOptions,
    currentUser: User,
  ): Promise<Paginated<TwitterRecord>> {
    const abilityToViewRecords = await this.recordPermissionsService.defineCurrentUserAbilityToViewAuthorRecordsOrThrow({
      currentUser,
      author: { id: authorId } as User,
    });

    const { data: retweets, ...paginationMetadata } = await this.recordRepository.findRetweetsByAuthorId(authorId, paginationOptions);

    const retweetsAllowedToBeViewed = retweets.filter((retweet) => abilityToViewRecords.can('view', retweet));

    const retweetsWithRetweetedRecordsAllowedToView = await this.filterRetweetsByRetweetedRecordsCurrentUserAllowedToView(
      retweetsAllowedToBeViewed,
      currentUser,
    );

    return { data: retweetsWithRetweetedRecordsAllowedToView, ...paginationMetadata };
  }

  public async getRetweetsByAuthorIds(
    ids: string[],
    paginationOptions: PaginationOptions,
    currentUser,
  ): Promise<Paginated<TwitterRecord>> {
    const { data: retweets, ...paginationMetadata } = await this.recordRepository.findRetweetsByAuthorIds(ids, paginationOptions);

    const retweetsAllowedToView = await asyncFilter(retweets, async (retweet) => {
      return this.recordPermissionsService.canCurrentUserViewRecord(currentUser, retweet);
    });

    const retweetsWithRetweetedRecordsAllowedToView = await this.filterRetweetsByRetweetedRecordsCurrentUserAllowedToView(
      retweetsAllowedToView,
      currentUser,
    );

    return { data: retweetsWithRetweetedRecordsAllowedToView, ...paginationMetadata };
  }

  public async deleteRetweetById(retweetId: string, currentUser: User): Promise<TwitterRecord> {
    const retweet = await this.recordRepository.findRetweetByIdOrThrow(retweetId);

    const abilityToManageRecords = await this.recordPermissionsService.defineAbilityToManageRecordsFor(currentUser);

    ForbiddenError.from(abilityToManageRecords).throwUnlessCan('delete', retweet);

    await this.recordRepository.deleteByIdOrThrow(retweetId);

    return retweet;
  }

  public async deleteRetweetByRetweetedRecordId(retweetedRecordId: string, currentUser: User): Promise<TwitterRecord> {
    const retweet = await this.recordRepository.findRetweetByAuthorAndRetweetedRecordIdsOrThrow(currentUser.id, retweetedRecordId);

    const abilityToManageRecords = await this.recordPermissionsService.defineAbilityToManageRecordsFor(currentUser);

    ForbiddenError.from(abilityToManageRecords).throwUnlessCan('delete', retweet);

    await this.recordRepository.deleteByIdOrThrow(retweet.id);

    return retweet;
  }
}
