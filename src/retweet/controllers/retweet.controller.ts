import {
  ClassSerializerInterceptor,
  Controller,
  Delete,
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
import { RETWEET_IMAGES_DESTINATION } from '../constants/retweet-images-destination.constant';
import { Retweet } from '../entities/retweet.entity';
import { RetweetService } from '../services/retweet.service';

@UseFilters(PermissionExceptionFilter)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('/retweet')
export class RetweetController {
  constructor(private readonly retweetService: RetweetService, private readonly recordImagesMapper: RecordImagesMapper) {}

  @UseInterceptors(UploadFilesInterceptor('images', RETWEET_IMAGES_DESTINATION))
  @UseGuards(AuthGuard)
  @Post('/:tweetId')
  public async retweet(
    @Param('tweetId') tweetId: string,
    @RecordContent() contentDto: RecordContentDto,
    @RecordPrivacy() privacySettingsDto: RecordPrivacySettingsDto,
    @CurrentUser() currentUser: User,
  ): Promise<Retweet> {
    const images = this.recordImagesMapper.mapMulterFilesToTwitterRecordImageArray(contentDto.images, RETWEET_IMAGES_DESTINATION);

    return this.retweetService.retweet(tweetId, { ...contentDto, images }, { ...privacySettingsDto }, currentUser);
  }

  @UseGuards(AuthGuard)
  @Delete('/:retweetId')
  public async deleteTweet(@CurrentUser() currentUser: User, @Param('retweetId') retweetId: string): Promise<void> {
    await this.retweetService.deleteRetweet(retweetId, currentUser);
  }

  @UseInterceptors(UploadFilesInterceptor('images', RETWEET_IMAGES_DESTINATION))
  @UseGuards(AuthGuard)
  @Patch('/:retweetId')
  public async editTweetContent(
    @CurrentUser() currentUser: User,
    @Param('retweetId') retweetId: string,
    @RecordContent() dto: RecordContentDto,
  ): Promise<Retweet> {
    const images = this.recordImagesMapper.mapMulterFilesToTwitterRecordImageArray(dto.images, RETWEET_IMAGES_DESTINATION);

    return this.retweetService.editRetweetContent(retweetId, { ...dto, images }, currentUser);
  }
}
