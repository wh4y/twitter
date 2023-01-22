import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';

import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { TwitterRecordRepository } from '../../twitter-record/repositories/twitter-record.repository';
import { Retweet } from '../entities/retweet.entity';

import { RetweetContent } from './retweet-service.options';

@Injectable()
export class RetweetService {
  constructor(private readonly recordRepository: TwitterRecordRepository, @InjectMapper() private readonly mapper: Mapper) {}

  public async retweet(tweetId: string, authorId: string, content: RetweetContent): Promise<Retweet> {
    const tweet = await this.recordRepository.findById(tweetId);

    const retweet = new TwitterRecord({ authorId, parentRecord: tweet, ...content });

    await this.recordRepository.save(retweet);

    return this.mapper.mapAsync(retweet, TwitterRecord, Retweet);
  }

  public async getAllUserRetweets(userId: string): Promise<Retweet[]> {
    const retweets = await this.recordRepository.findRetweetsByAuthorId(userId);

    return this.mapper.mapArrayAsync(retweets, TwitterRecord, Retweet);
  }
}
