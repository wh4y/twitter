import {
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
import { UploadFilesInterceptor } from 'common/file';

import { PermissionExceptionFilter } from '../../record-permissions/exception-filters/permission.exception-filter';
import { RecordPrivacy } from '../../record-privacy/decorators/record-privacy.decorator';
import { UpdateRecordPrivacySettingsDto } from '../../record-privacy/dtos/update-record-privacy-settings.dto';
import { RecordContent } from '../../twitter-record/decorators/record-content.decorator';
import { RecordContentDto } from '../../twitter-record/dtos/record-content.dto';
import { RecordNotExistExceptionFilter } from '../../twitter-record/exception-filters/record-not-exist.exception-filter';
import { RecordImagesMapper } from '../../twitter-record/mappers/record-images.mapper';
import { User } from '../../users/entities/user.entity';
import { UserNotExistExceptionFilter } from '../../users/exception-filters/user-not-exist.exception-filter';
import { Quote } from '../entities/quote.entity';
import { QuoteService } from '../services/quote.service';

@UseFilters(PermissionExceptionFilter, RecordNotExistExceptionFilter, UserNotExistExceptionFilter)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('/quote')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService, private readonly recordImagesMapper: RecordImagesMapper) {}

  @UseInterceptors(UploadFilesInterceptor('images'))
  @UseGuards(AuthGuard)
  @Post('/:recordId')
  public async quoteRecord(
    @Param('recordId') recordId: string,
    @RecordContent() quoteContent: RecordContentDto,
    @RecordPrivacy() privacySettings: UpdateRecordPrivacySettingsDto,
    @CurrentUser() currentUser: User,
  ): Promise<Quote> {
    const images = this.recordImagesMapper.mapMulterFilesToTwitterRecordImageArray(quoteContent.images);

    return this.quoteService.quoteRecord(recordId, { ...quoteContent, images }, privacySettings, currentUser);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:quoteId')
  public async deleteQuote(@Param('quoteId') quoteId: string, @CurrentUser() currentUser: User): Promise<void> {
    await this.quoteService.deleteQuoteById(quoteId, currentUser);
  }
}
