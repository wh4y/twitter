import { ClassSerializerInterceptor, Controller, Delete, Param, Post, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';

import { AuthGuard } from 'common/auth';
import { CurrentUser } from 'common/auth/decorator/current-user.decorator';
import { UploadFilesInterceptor } from 'common/file';

import { PermissionExceptionFilter } from '../../record-permissions/exception-filters/permission.exception-filter';
import { RecordPrivacy } from '../../record-privacy/decorators/record-privacy.decorator';
import { UpdateRecordPrivacySettingsDto } from '../../record-privacy/dtos/update-record-privacy-settings.dto';
import { RecordNotExistExceptionFilter } from '../../twitter-record/exception-filters/record-not-exist.exception-filter';
import { User } from '../../users/entities/user.entity';
import { RETWEET_IMAGES_DESTINATION } from '../constants/retweet-images-destination.constant';
import { Retweet } from '../entities/retweet.entity';
import { RetweetExceptionFilter } from '../exception-filter/retweet.exception-filter';
import { RetweetService } from '../services/retweet.service';

@UseFilters(PermissionExceptionFilter, RecordNotExistExceptionFilter)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('/retweet')
export class RetweetController {
  constructor(private readonly retweetService: RetweetService) {}

  @UseFilters(RetweetExceptionFilter)
  @UseInterceptors(UploadFilesInterceptor('images', RETWEET_IMAGES_DESTINATION))
  @UseGuards(AuthGuard)
  @Post('/:tweetId')
  public async retweet(
    @Param('tweetId') tweetId: string,
    @RecordPrivacy() privacySettingsDto: UpdateRecordPrivacySettingsDto,
    @CurrentUser() currentUser: User,
  ): Promise<Retweet> {
    return this.retweetService.retweet(tweetId, { ...privacySettingsDto }, currentUser);
  }

  @UseGuards(AuthGuard)
  @Delete('/:retweetId')
  public async deleteTweet(@CurrentUser() currentUser: User, @Param('retweetId') retweetId: string): Promise<void> {
    await this.retweetService.deleteRetweet(retweetId, currentUser);
  }
}
