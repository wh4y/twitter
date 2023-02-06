import { Injectable } from '@nestjs/common';

import { CommentService } from '../../comment/services/comment.service';
import { QuoteService } from '../../quote/services/quote.service';
import { RetweetService } from '../../retweet/services/retweet.service';
import { TweetService } from '../../tweet/services/tweet.service';
import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { sortRecordsByCreatedAtDesc } from '../../twitter-record/utils/sort-records-by-created-at-desc.util';
import { UserFollowingsService } from '../../user-followings/services/user-followings.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class RecordsFeedService {
  constructor(
    private readonly tweetService: TweetService,
    private readonly retweetService: RetweetService,
    private readonly quoteService: QuoteService,
    private readonly commentService: CommentService,
    private readonly userFollowingsService: UserFollowingsService,
  ) {}

  public async getRecordsOfFollowedUsers(currentUser: User): Promise<Array<TwitterRecord>> {
    const followings = await this.userFollowingsService.getUserFollowings(currentUser.id);

    const followedUsersIds = followings.map((following) => following.followedUserId);

    const followedUsersRecords: TwitterRecord[] = [];

    for (const followedUserId of followedUsersIds) {
      const followedUserTweets = await this.tweetService.getUserTweets(followedUserId, currentUser);
      const followedUserRetweets = await this.retweetService.getUserRetweets(followedUserId, currentUser);
      const followedUserQuotes = await this.quoteService.getUserQuotes(followedUserId, currentUser);
      const followedUserComments = await this.commentService.getUserComments(followedUserId, currentUser);

      followedUsersRecords.push(...followedUserTweets, ...followedUserRetweets, ...followedUserQuotes, ...followedUserComments);
    }

    return sortRecordsByCreatedAtDesc(followedUsersRecords);
  }
}
