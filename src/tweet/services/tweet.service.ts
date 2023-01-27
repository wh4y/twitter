import { ForbiddenError } from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { RecordPermissionsService } from '../../record-permissions/services/record-permissions.service';
import { RecordPrivacySettings } from '../../record-privacy/entities/record-privacy-settings.entity';
import { TwitterRecordRepository } from '../../twitter-record/repositories/twitter-record.repository';
import { User } from '../../users/entities/user.entity';
import { Tweet } from '../entities/tweet.entity';

import { EditTweetContentOptions, TweetContent } from './tweet-service.options';

@Injectable()
export class TweetService {
  constructor(
    private readonly recordRepository: TwitterRecordRepository,
    private readonly recordPermissionsService: RecordPermissionsService,
  ) {}

  public async postTweet(currentUser: User, content: TweetContent, privacySettings: Partial<RecordPrivacySettings>): Promise<Tweet> {
    const recordPrivacySettings = new RecordPrivacySettings({ ...privacySettings });

    const tweet = new Tweet({ authorId: currentUser.id, ...content, privacySettings: recordPrivacySettings });

    await this.recordRepository.saveTweet(tweet);

    return tweet;
  }

  public async getUserTweets(userId: string, currentUser: User): Promise<Tweet[]> {
    await this.recordPermissionsService.currentUserCanViewUserRecordsOrThrow(currentUser, { id: userId } as User);

    const abilityToViewRecords = await this.recordPermissionsService.defineAbilityToViewRecordsFor(currentUser);

    const tweets = await this.recordRepository.findTweetsByAuthorIdOrThrow(userId);

    const tweetsAllowedToView = tweets.filter((tweet) => abilityToViewRecords.can('view', tweet));

    return tweetsAllowedToView;
  }

  public async deleteTweet(tweetId: string, currentUser: User): Promise<Tweet> {
    const tweet = await this.recordRepository.findTweetByIdOrThrow(tweetId);

    const abilityToManageRecords = await this.recordPermissionsService.defineAbilityToManageRecordsFor(currentUser);

    ForbiddenError.from(abilityToManageRecords).throwUnlessCan('delete', tweet);

    await this.recordRepository.deleteByIdOrThrow(tweetId);

    return tweet;
  }

  public async editTweetContent(tweetId, options: EditTweetContentOptions, currentUser: User): Promise<Tweet> {
    const tweet = await this.recordRepository.findTweetByIdOrThrow(tweetId);

    const abilityToManageRecords = await this.recordPermissionsService.defineAbilityToManageRecordsFor(currentUser);

    ForbiddenError.from(abilityToManageRecords).throwUnlessCan('edit', tweet);

    Object.assign(tweet, options);

    await this.recordRepository.saveTweet(tweet);

    return tweet;
  }
}
