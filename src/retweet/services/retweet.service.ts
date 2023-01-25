import { ForbiddenError } from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { RecordPermissionsService } from '../../record-permissions/services/record-permissions.service';
import { RecordPrivacySettings } from '../../record-privacy/entities/record-privacy-settings.entity';
import { TwitterRecordRepository } from '../../twitter-record/repositories/twitter-record.repository';
import { User } from '../../users/entities/user.entity';
import { Retweet } from '../entities/retweet.entity';

import { EditRetweetOptions, RetweetOptions } from './retweet-service.options';

@Injectable()
export class RetweetService {
  constructor(
    private readonly recordRepository: TwitterRecordRepository,
    private readonly recordPermissionsService: RecordPermissionsService,
  ) {}

  public async retweet(tweetId: string, options: RetweetOptions): Promise<Retweet> {
    const recordDefaultPrivacySettings = new RecordPrivacySettings();

    const retweet = new Retweet({
      ...options,
      retweetedRecordId: tweetId,
      privacySettings: recordDefaultPrivacySettings,
    });

    await this.recordRepository.saveRetweet(retweet);

    return retweet;
  }

  public async getUserRetweets(userId: string): Promise<Retweet[]> {
    return this.recordRepository.findRetweetsByAuthorId(userId);
  }

  public async deleteRetweet(retweetId: string, currentUser: User): Promise<Retweet> {
    const retweet = await this.recordRepository.findRetweetByIdOrThrow(retweetId);

    const abilityToManageRecords = await this.recordPermissionsService.defineAbilityToManageRecordsFor(currentUser);

    ForbiddenError.from(abilityToManageRecords).throwUnlessCan('delete', retweet);

    await this.recordRepository.deleteByIdOrThrow(retweetId);

    return retweet;
  }

  public async editRetweetContent(retweetId: string, options: EditRetweetOptions, currentUser: User): Promise<Retweet> {
    const retweet = await this.recordRepository.findRetweetByIdOrThrow(retweetId);

    const abilityToManageRecords = await this.recordPermissionsService.defineAbilityToManageRecordsFor(currentUser);

    ForbiddenError.from(abilityToManageRecords).throwUnlessCan('edit', retweet);

    Object.assign(retweet, options);

    await this.recordRepository.saveRetweet(retweet);

    return retweet;
  }
}
