import { ForbiddenError } from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { RecordPermissionsService } from '../../record-permissions/services/record-permissions.service';
import { RecordPrivacySettings } from '../../record-privacy/entities/record-privacy-settings.entity';
import { TwitterRecordRepository } from '../../twitter-record/repositories/twitter-record.repository';
import { User } from '../../users/entities/user.entity';
import { Retweet } from '../entities/retweet.entity';

import { EditRetweetOptions, RetweetContent } from './retweet-service.options';

@Injectable()
export class RetweetService {
  constructor(
    private readonly recordRepository: TwitterRecordRepository,
    private readonly recordPermissionsService: RecordPermissionsService,
  ) {}

  public async retweet(
    tweetId: string,
    content: RetweetContent,
    privacySettings: Partial<RecordPrivacySettings>,
    currentUser: User,
  ): Promise<Retweet> {
    const recordPrivacySettings = new RecordPrivacySettings({ ...privacySettings });

    const retweet = new Retweet({
      authorId: currentUser.id,
      ...content,
      retweetedRecordId: tweetId,
      privacySettings: recordPrivacySettings,
    });

    await this.recordRepository.saveRetweet(retweet);

    return retweet;
  }

  public async getUserRetweets(userId: string, currentUser: User): Promise<Retweet[]> {
    await this.recordPermissionsService.currentUserCanViewUserRecordsOrThrow(currentUser, { id: userId } as User);

    const abilityToViewRecords = await this.recordPermissionsService.defineAbilityToViewRecordsFor(currentUser);

    const retweets = await this.recordRepository.findRetweetsByAuthorId(userId);

    const retweetsAllowedToView = retweets.filter((retweet) => abilityToViewRecords.can('view', retweet));

    return retweetsAllowedToView;
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
