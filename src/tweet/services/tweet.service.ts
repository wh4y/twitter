import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';

import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { TwitterRecordRepository } from '../../twitter-record/repositories/twitter-record.repository';
import { Tweet } from '../entities/tweet.entity';

import { PostTweetOptions } from './tweet-service.options';

@Injectable()
export class TweetService {
  constructor(private readonly recordRepository: TwitterRecordRepository, @InjectMapper() private readonly mapper: Mapper) {}

  public async postTweet(options: PostTweetOptions): Promise<Tweet> {
    const tweet = new TwitterRecord({ ...options });

    await this.recordRepository.save(tweet);

    return this.mapper.mapAsync(tweet, TwitterRecord, Tweet);
  }

  public async getAllUserTweets(userId: string): Promise<Tweet[]> {
    const tweets = await this.recordRepository.findManyByAuthorIdOrThrow(userId);

    return this.mapper.mapArrayAsync(tweets, TwitterRecord, Tweet);
  }
}
