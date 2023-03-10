import { ForbiddenError } from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { RecordPermissionsService } from '../../record-permissions/services/record-permissions.service';
import { RecordPrivacySettings } from '../../record-privacy/entities/record-privacy-settings.entity';
import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { RecordImageRepository } from '../../twitter-record/repositories/record-image.repository';
import { TwitterRecordRepository } from '../../twitter-record/repositories/twitter-record.repository';
import { EditRecordContentOptions } from '../../twitter-record/types/edit-record-content-options.type';
import { RecordContent } from '../../twitter-record/types/record-content.type';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class TweetService {
  constructor(
    private readonly recordRepository: TwitterRecordRepository,
    private readonly recordImageRepository: RecordImageRepository,
    private readonly recordPermissionsService: RecordPermissionsService,
  ) {}

  public async postTweet(
    currentUser: User,
    content: RecordContent,
    privacySettings: Partial<RecordPrivacySettings>,
  ): Promise<TwitterRecord> {
    const recordPrivacySettings = new RecordPrivacySettings({ ...privacySettings });

    const tweet = new TwitterRecord({ authorId: currentUser.id, ...content, privacySettings: recordPrivacySettings });

    await this.recordRepository.saveTweet(tweet);

    return tweet;
  }

  public async deleteTweet(tweetId: string, currentUser: User): Promise<TwitterRecord> {
    const tweet = await this.recordRepository.findTweetByIdOrThrow(tweetId);

    const abilityToManageRecords = await this.recordPermissionsService.defineAbilityToManageRecordsFor(currentUser);

    ForbiddenError.from(abilityToManageRecords).throwUnlessCan('delete', tweet);

    await this.recordRepository.deleteByIdOrThrow(tweetId);

    return tweet;
  }

  public async editTweetContent(
    tweetId,
    { idsOfImagesToBeSaved, newImages, text }: EditRecordContentOptions,
    currentUser: User,
  ): Promise<TwitterRecord> {
    const tweet = await this.recordRepository.findTweetByIdOrThrow(tweetId);

    const abilityToManageRecords = await this.recordPermissionsService.defineAbilityToManageRecordsFor(currentUser);

    ForbiddenError.from(abilityToManageRecords).throwUnlessCan('edit', tweet);

    const existingImagesToBeSaved = await this.recordImageRepository.findImagesByIds(idsOfImagesToBeSaved);
    const updatedRecordImages = [...existingImagesToBeSaved, ...newImages];

    tweet.images = updatedRecordImages;
    tweet.text = text;

    await this.recordRepository.saveTweet(tweet);

    return tweet;
  }
}
