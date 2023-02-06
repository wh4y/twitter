import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { AuthGuard } from 'common/auth';
import { CurrentUser } from 'common/auth/decorator/current-user.decorator';

import { PermissionExceptionFilter } from '../../record-permissions/exception-filters/permission.exception-filter';
import { RecordPrivacy } from '../../record-privacy/decorators/record-privacy.decorator';
import { UpdateRecordPrivacySettingsDto } from '../../record-privacy/dtos/update-record-privacy-settings.dto';
import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { RecordNotExistExceptionFilter } from '../../twitter-record/exception-filters/record-not-exist.exception-filter';
import { User } from '../../users/entities/user.entity';
import { RetweetedRecordIdDto } from '../dtos/retweeted-record-id.dto';
import { RetweetExceptionFilter } from '../exception-filter/retweet.exception-filter';
import { RetweetService } from '../services/retweet.service';

@UseFilters(PermissionExceptionFilter, RecordNotExistExceptionFilter)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('/retweet')
export class RetweetController {
  constructor(private readonly retweetService: RetweetService) {}

  @UseFilters(RetweetExceptionFilter)
  @UseGuards(AuthGuard)
  @Post('/:tweetId')
  public async retweet(
    @Param('tweetId') tweetId: string,
    @RecordPrivacy() privacySettingsDto: UpdateRecordPrivacySettingsDto,
    @CurrentUser() currentUser: User,
  ): Promise<TwitterRecord> {
    return this.retweetService.retweet(tweetId, { ...privacySettingsDto }, currentUser);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @Delete('/:retweetId')
  public async deleteRetweetById(@CurrentUser() currentUser: User, @Param('retweetId') retweetId: string): Promise<void> {
    await this.retweetService.deleteRetweetById(retweetId, currentUser);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @Delete()
  public async undoRetweetByRetweetedRecordId(
    @CurrentUser() currentUser: User,
    @Body() { retweetedRecordId }: RetweetedRecordIdDto,
  ): Promise<void> {
    await this.retweetService.deleteRetweetByRetweetedRecordId(retweetedRecordId, currentUser);
  }
}
