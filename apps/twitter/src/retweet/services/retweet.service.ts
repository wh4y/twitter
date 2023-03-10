import { ForbiddenError } from '@casl/ability';
import { Injectable } from '@nestjs/common';

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
