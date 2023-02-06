import { Injectable } from '@nestjs/common';

import { QuoteService } from '../../quote/services/quote.service';
import { RetweetService } from '../../retweet/services/retweet.service';
import { TweetService } from '../../tweet/services/tweet.service';
import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { sortRecordsByCreatedAtDesc } from '../../twitter-record/utils/sort-records-by-created-at-desc.util';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class UserProfileService {
  constructor(
    private readonly tweetService: TweetService,
    private readonly retweetService: RetweetService,
    private readonly quoteService: QuoteService,
  ) {}

  public async getUserRecordsSortedByDate(userId: string, currentUser: User): Promise<TwitterRecord[]> {
    const tweets = await this.tweetService.getUserTweets(userId, currentUser);
    const retweets = await this.retweetService.getUserRetweets(userId, currentUser);
    const quotes = await this.quoteService.getUserQuotes(userId, currentUser);

    const records = [...tweets, ...retweets, ...quotes];

    return sortRecordsByCreatedAtDesc(records);
  }
}
