import { Controller, Get, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';

import { AuthGuard } from 'common/auth';
import { CurrentUser } from 'common/auth/decorator/current-user.decorator';
import { UploadFilesInterceptor } from 'common/file';

import { RecordContent } from '../../twitter-record/decorators/record-content.decorator';
import { RecordContentDto } from '../../twitter-record/dtos/record-content.dto';
import { RecordImagesMapper } from '../../twitter-record/mappers/record-images.mapper';
import { User } from '../../users/entities/user.entity';
import { TWEET_IMAGES_DESTINATION } from '../constants/tweet-images-destination.constant';
import { Tweet } from '../entities/tweet.entity';
import { TweetService } from '../services/tweet.service';

@Controller('/tweet')
export class TweetController {
  constructor(private readonly tweetService: TweetService, private readonly recordImagesMapper: RecordImagesMapper) {}

  @UseInterceptors(UploadFilesInterceptor('images', TWEET_IMAGES_DESTINATION))
  @UseGuards(AuthGuard)
  @Post()
  public async postTweet(@CurrentUser() currentUser: User, @RecordContent() tweetContent: RecordContentDto): Promise<Tweet> {
    const images = this.recordImagesMapper.mapMulterFilesToTwitterRecordImageArray(tweetContent.images, TWEET_IMAGES_DESTINATION);

    return this.tweetService.postTweet({ authorId: currentUser.id, ...tweetContent, images });
  }

  @Get('/all/:userId')
  public async getAllUserTweets(@Param('userId') userId: string): Promise<Tweet[]> {
    return this.tweetService.getAllUserTweets(userId);
  }
}
