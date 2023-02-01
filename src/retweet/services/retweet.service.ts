import { ForbiddenError } from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { ActionForbiddenException } from '../../record-permissions/exceptions/action-forbidden.exception';
import { RecordPermissionsService } from '../../record-permissions/services/record-permissions.service';
import { RecordPrivacySettings } from '../../record-privacy/entities/record-privacy-settings.entity';
import { TwitterRecordRepository } from '../../twitter-record/repositories/twitter-record.repository';
import { User } from '../../users/entities/user.entity';
import { Retweet } from '../entities/retweet.entity';
import { RetweetedRecord } from '../entities/retweeted-record.entity';

@Injectable()
export class RetweetService {
  constructor(
    private readonly recordRepository: TwitterRecordRepository,
    private readonly recordPermissionsService: RecordPermissionsService,
  ) {}

  public async retweet(recordId: string, privacySettings: Partial<RecordPrivacySettings>, currentUser: User): Promise<Retweet> {
    const recordPrivacySettings = new RecordPrivacySettings({ ...privacySettings });

    let retweetedRecordId = recordId;

    const retweet = await this.recordRepository.findRetweetById(recordId);

    if (retweet) {
      retweetedRecordId = retweet.retweetedRecordId;
    }

    const newRetweet = new Retweet({
      authorId: currentUser.id,
      retweetedRecordId,
      privacySettings: recordPrivacySettings,
    });

    await this.recordRepository.saveRetweetIfNotExistOrThrow(newRetweet);

    return newRetweet;
  }

  public async getUserRetweets(userId: string, currentUser: User): Promise<Retweet[]> {
    const abilityToViewRecords = await this.recordPermissionsService.defineCurrentUserAbilityToViewUserRecords({
      currentUser,
      target: { id: userId } as User,
    });

    const retweets = await this.recordRepository.findRetweetsByAuthorId(userId);

    const retweetsAllowedToView = retweets.filter((retweet) => abilityToViewRecords.can('view', retweet));

    const retweetsWithRetweetedRecordsAllowedToBeViewed = Promise.all(
      retweetsAllowedToView.map(async (retweet) => {
        const canCurrentUserViewRetweetedRecord = await this.canCurrentUserViewRetweetedRecord(currentUser, retweet.retweetedRecord);

        if (!canCurrentUserViewRetweetedRecord) {
          retweet.retweetedRecord = null;
        }

        return retweet;
      }),
    );

    return retweetsWithRetweetedRecordsAllowedToBeViewed;
  }

  private async canCurrentUserViewRetweetedRecord(currentUser: User, record: RetweetedRecord): Promise<boolean> {
    try {
      const abilityToViewUserRecords = await this.recordPermissionsService.defineCurrentUserAbilityToViewUserRecords({
        currentUser,
        target: { id: record.authorId } as User,
      });

      return abilityToViewUserRecords.can('view', record);
    } catch (e) {
      if (e instanceof ActionForbiddenException) {
        return false;
      }

      throw e;
    }
  }

  public async deleteRetweet(retweetId: string, currentUser: User): Promise<Retweet> {
    const retweet = await this.recordRepository.findRetweetByIdOrThrow(retweetId);

    const abilityToManageRecords = await this.recordPermissionsService.defineAbilityToManageRecordsFor(currentUser);

    ForbiddenError.from(abilityToManageRecords).throwUnlessCan('delete', retweet);

    await this.recordRepository.deleteByIdOrThrow(retweetId);

    return retweet;
  }
}
