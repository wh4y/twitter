import { ClassSerializerInterceptor, Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';

import { AuthGuard } from 'common/auth';
import { CurrentUser } from 'common/auth/decorator/current-user.decorator';

import { Comment } from '../../comment/entities/comment.entity';
import { Quote } from '../../quote/entities/quote.entity';
import { Retweet } from '../../retweet/entities/retweet.entity';
import { Tweet } from '../../tweet/entities/tweet.entity';
import { User } from '../../users/entities/user.entity';
import { RecordsFeedService } from '../services/records-feed.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('/records-feed')
export class RecordsFeedController {
  constructor(private readonly recordsFeedService: RecordsFeedService) {}

  @UseGuards(AuthGuard)
  @Get()
  public async getRecordsOfCurrentUserFollowings(@CurrentUser() currenUser: User): Promise<Array<Tweet | Retweet | Quote | Comment>> {
    return this.recordsFeedService.getRecordsOfFollowedUsers(currenUser);
  }
}
