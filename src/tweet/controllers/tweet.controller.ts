import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { AuthGuard } from 'common/auth';
import { CurrentUser } from 'common/auth/decorator/current-user.decorator';
import { UploadFilesInterceptor } from 'common/file';

import { PermissionExceptionFilter } from '../../record-permissions/exception-filters/permission.exception-filter';
import { RecordPrivacy } from '../../record-privacy/decorators/record-privacy.decorator';
import { UpdateRecordPrivacySettingsDto } from '../../record-privacy/dtos/update-record-privacy-settings.dto';
import { RecordContent } from '../../twitter-record/decorators/record-content.decorator';
import { EditRecordContentDto } from '../../twitter-record/dtos/edit-record-content.dto';
import { RecordContentDto } from '../../twitter-record/dtos/record-content.dto';
import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { RecordNotExistExceptionFilter } from '../../twitter-record/exception-filters/record-not-exist.exception-filter';
import { RecordImagesMapper } from '../../twitter-record/mappers/record-images.mapper';
import { User } from '../../users/entities/user.entity';
import { TweetService } from '../services/tweet.service';

@UseFilters(PermissionExceptionFilter, RecordNotExistExceptionFilter)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('/tweet')
export class TweetController {
  constructor(private readonly tweetService: TweetService, private readonly recordImagesMapper: RecordImagesMapper) {}

  @UseInterceptors(UploadFilesInterceptor('images'))
  @UseGuards(AuthGuard)
  @Post()
  public async postTweet(
    @CurrentUser() currentUser: User,
    @RecordContent() tweetContent: RecordContentDto,
    @RecordPrivacy() privacySettings: UpdateRecordPrivacySettingsDto,
  ): Promise<TwitterRecord> {
    const images = this.recordImagesMapper.mapMulterFilesToTwitterRecordImageArray(tweetContent.images);

    return this.tweetService.postTweet(currentUser, { ...tweetContent, images }, { ...privacySettings });
  }

  @UseGuards(AuthGuard)
  @Get('/user-tweets/:userId')
  public async getUserTweets(@Param('userId') userId: string, @CurrentUser() currentUser: User): Promise<TwitterRecord[]> {
    return this.tweetService.getUserTweets(userId, currentUser);
  }

  @UseGuards(AuthGuard)
  @Delete('/:tweetId')
  public async deleteTweet(@CurrentUser() currentUser: User, @Param('tweetId') tweetId: string): Promise<void> {
    await this.tweetService.deleteTweet(tweetId, currentUser);
  }

  @UseInterceptors(UploadFilesInterceptor('newImages'))
  @UseGuards(AuthGuard)
  @Patch('/:tweetId')
  public async editTweetContent(
    @CurrentUser() currentUser: User,
    @Param('tweetId') tweetId: string,
    @Body() dto: EditRecordContentDto,
    @UploadedFiles() newImages: Express.Multer.File[],
  ): Promise<TwitterRecord> {
    const images = this.recordImagesMapper.mapMulterFilesToTwitterRecordImageArray(newImages);

    return this.tweetService.editTweetContent(tweetId, { ...dto, newImages: images }, currentUser);
  }
}
