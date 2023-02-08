import { ForbiddenError } from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { RecordPermissionsService } from '../../record-permissions/services/record-permissions.service';
import { RecordPrivacySettings } from '../../record-privacy/entities/record-privacy-settings.entity';
import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { RecordImageRepository } from '../../twitter-record/repositories/record-image.repository';
import { TwitterRecordRepository } from '../../twitter-record/repositories/twitter-record.repository';
import { EditRecordContentOptions } from '../../twitter-record/types/edit-record-content-options.type';
import { User } from '../../users/entities/user.entity';

import { QuoteContentOptions } from './quote-service.options';

@Injectable()
export class QuoteService {
  constructor(
    private readonly recordRepository: TwitterRecordRepository,
    private readonly recordImageRepository: RecordImageRepository,
    private readonly recordPermissionsService: RecordPermissionsService,
  ) {}

  public async quoteRecord(
    recordId: string,
    quoteContent: QuoteContentOptions,
    privacySettings: Partial<RecordPrivacySettings>,
    currentUser: User,
  ): Promise<TwitterRecord> {
    const recordPrivacySettings = new RecordPrivacySettings({ ...privacySettings });

    const quote = new TwitterRecord({
      authorId: currentUser.id,
      ...quoteContent,
      parentRecordId: recordId,
      privacySettings: recordPrivacySettings,
    });

    await this.recordRepository.saveQuote(quote);

    return quote;
  }

  public async deleteQuoteById(id: string, currentUser: User): Promise<TwitterRecord> {
    const quote = await this.recordRepository.findQuoteByIdOrThrow(id);

    const abilityToManageRecords = await this.recordPermissionsService.defineAbilityToManageRecordsFor(currentUser);

    ForbiddenError.from(abilityToManageRecords).throwUnlessCan('delete', quote);

    await this.recordRepository.deleteByIdOrThrow(id);

    return quote;
  }

  public async editQuoteContent(
    quoteId: string,
    { idsOfImagesToBeSaved, newImages, text }: EditRecordContentOptions,
    currentUser: User,
  ): Promise<TwitterRecord> {
    const quote = await this.recordRepository.findQuoteByIdOrThrow(quoteId);

    const abilityToManageRecords = await this.recordPermissionsService.defineAbilityToManageRecordsFor(currentUser);

    ForbiddenError.from(abilityToManageRecords).throwUnlessCan('edit', quote);

    const existingImagesToBeSaved = await this.recordImageRepository.findImagesByIds(idsOfImagesToBeSaved);
    const updatedRecordImages = [...existingImagesToBeSaved, ...newImages];

    quote.images = updatedRecordImages;
    quote.text = text;

    await this.recordRepository.saveQuote(quote);

    return quote;
  }
}
