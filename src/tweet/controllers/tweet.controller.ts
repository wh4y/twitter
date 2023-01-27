import {
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { AuthGuard } from 'common/auth';
import { CurrentUser } from 'common/auth/decorator/current-user.decorator';
import { UploadFilesInterceptor } from 'common/file';

import { PermissionExceptionFilter } from '../../record-permissions/exception-filters/permission.exception-filter';
import { RecordPrivacy } from '../../record-privacy/decorators/record-privacy.decorator';
import { RecordPrivacySettingsDto } from '../../record-privacy/dtos/record-privacy-settings.dto';
import { RecordContent } from '../../twitter-record/decorators/record-content.decorator';
import { RecordContentDto } from '../../twitter-record/dtos/record-content.dto';
import { RecordImagesMapper } from '../../twitter-record/mappers/record-images.mapper';
import { User } from '../../users/entities/user.entity';
import { TWEET_IMAGES_DESTINATION } from '../constants/tweet-images-destination.constant';
import { Tweet } from '../entities/tweet.entity';
import { TweetService } from '../services/tweet.service';

@UseFilters(PermissionExceptionFilter)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('/tweet')
export class TweetController {
  constructor(private readonly tweetService: TweetService, private readonly recordImagesMapper: RecordImagesMapper) {}

  @UseInterceptors(UploadFilesInterceptor('images', TWEET_IMAGES_DESTINATION))
  @UseGuards(AuthGuard)
  @Post()
  public async postTweet(
    @CurrentUser() currentUser: User,
    @RecordContent() tweetContent: RecordContentDto,
    @RecordPrivacy() privacySettings: RecordPrivacySettingsDto,
  ): Promise<Tweet> {
    const images = this.recordImagesMapper.mapMulterFilesToTwitterRecordImageArray(tweetContent.images, TWEET_IMAGES_DESTINATION);

    return this.tweetService.postTweet(currentUser, { ...tweetContent, images }, { ...privacySettings });
  }

  @UseGuards(AuthGuard)
  @Get('/user-tweets/:userId')
  public async getUserTweets(@Param('userId') userId: string, @CurrentUser() currentUser: User): Promise<Tweet[]> {
    return this.tweetService.getUserTweets(userId, currentUser);
  }

  @UseGuards(AuthGuard)
  @Delete('/:tweetId')
  public async deleteTweet(@CurrentUser() currentUser: User, @Param('tweetId') tweetId: string): Promise<void> {
    await this.tweetService.deleteTweet(tweetId, currentUser);
  }

  @UseInterceptors(UploadFilesInterceptor('images', TWEET_IMAGES_DESTINATION))
  @UseGuards(AuthGuard)
  @Patch('/:tweetId')
  public async editTweetContent(
    @CurrentUser() currentUser: User,
    @Param('tweetId') tweetId: string,
    @RecordContent() dto: RecordContentDto,
  ): Promise<Tweet> {
    const images = this.recordImagesMapper.mapMulterFilesToTwitterRecordImageArray(dto.images, TWEET_IMAGES_DESTINATION);

    return this.tweetService.editTweetContent(tweetId, { ...dto, images }, currentUser);
  }
}
