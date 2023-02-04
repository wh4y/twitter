import { Injectable } from '@nestjs/common';

import { Quote } from '../../quote/entities/quote.entity';
import { QuoteService } from '../../quote/services/quote.service';
import { Retweet } from '../../retweet/entities/retweet.entity';
import { RetweetService } from '../../retweet/services/retweet.service';
import { Tweet } from '../../tweet/entities/tweet.entity';
import { TweetService } from '../../tweet/services/tweet.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class UserProfileService {
  constructor(
    private readonly tweetService: TweetService,
    private readonly retweetService: RetweetService,
    private readonly quoteService: QuoteService,
  ) {}

  public async getUserRecordsSortedByDate(userId: string, currentUser: User): Promise<Array<Tweet | Retweet>> {
    const tweets = await this.tweetService.getUserTweets(userId, currentUser);
    const retweets = await this.retweetService.getUserRetweets(userId, currentUser);
    const quotes = await this.quoteService.getUserQuotes(userId, currentUser);

    return this.sortTweetResponsesByDateDESC([...tweets, ...retweets, ...quotes]);
  }

  private sortTweetResponsesByDateDESC(records: Array<Tweet | Retweet>): Array<Tweet | Retweet | Quote> {
    return [...records].sort((firstRecord, secondRecord) => secondRecord.createdAt.getTime() - firstRecord.createdAt.getTime());
  }
}
