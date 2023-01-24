import { Injectable } from '@nestjs/common';

import { Retweet } from '../../entities/retweet.entity';
import { TwitterRecordRepository } from '../../repositories/twitter-record.repository';

import { RetweetOptions } from './retweet-service.options';

@Injectable()
export class RetweetService {
  constructor(private readonly recordRepository: TwitterRecordRepository) {}

  public async retweet(tweetId: string, options: RetweetOptions): Promise<Retweet> {
    const retweet = new Retweet({ ...options, retweetedRecordId: tweetId });

    await this.recordRepository.saveRetweet(retweet);

    return retweet;
  }

  public async getUserRetweets(userId: string): Promise<Retweet[]> {
    return this.recordRepository.findRetweetsByAuthorId(userId);
  }
}
