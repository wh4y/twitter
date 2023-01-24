import { Injectable } from '@nestjs/common';

import { RecordsPrivacyService } from '../../../privacy/services/records-privacy/records-privacy.service';
import { Tweet } from '../../entities/tweet.entity';
import { TwitterRecordRepository } from '../../repositories/twitter-record.repository';

import { PostTweetOptions } from './tweet-service.options';

@Injectable()
export class TweetService {
  constructor(
    private readonly recordRepository: TwitterRecordRepository,
    private readonly recordPrivacyService: RecordsPrivacyService,
  ) {}

  public async postTweet(options: PostTweetOptions): Promise<Tweet> {
    const tweet = new Tweet({ ...options });

    await this.recordRepository.saveTweet(tweet);

    await this.recordPrivacyService.defineDefaultPrivacySettingsForRecord(tweet.id);

    return tweet;
  }

  public async getAllUserTweets(userId: string): Promise<Tweet[]> {
    return this.recordRepository.findTweetsByAuthorIdOrThrow(userId);
  }
}
