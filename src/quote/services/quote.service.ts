import { ForbiddenError } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { asyncFilter } from 'common/array-utils';

import { RecordPermissionsService } from '../../record-permissions/services/record-permissions.service';
import { RecordPrivacySettings } from '../../record-privacy/entities/record-privacy-settings.entity';
import { RecordImageRepository } from '../../twitter-record/repositories/record-image.repository';
import { TwitterRecordRepository } from '../../twitter-record/repositories/twitter-record.repository';
import { EditRecordContentOptions } from '../../twitter-record/types/edit-record-content-options.type';
import { User } from '../../users/entities/user.entity';
import { Quote } from '../entities/quote.entity';

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
  ): Promise<Quote> {
    const recordPrivacySettings = new RecordPrivacySettings({ ...privacySettings });

    const quote = new Quote({
      authorId: currentUser.id,
      ...quoteContent,
      quotedRecordId: recordId,
      privacySettings: recordPrivacySettings,
    });

    await this.recordRepository.saveQuote(quote);

    return quote;
  }

  private async nullifyQuotesQuotedRecordsCurrentUserCannotView(quotes: Quote[], currentUser: User): Promise<void> {
    await Promise.all(
      quotes.map(async (quote) => {
        if (quote.quotedRecord === null) {
          return quote;
        }

        const canCurrentUserViewRetweetedRecord = await this.recordPermissionsService.canCurrentUserViewRecord(
          currentUser,
          quote.quotedRecord,
        );

        if (!canCurrentUserViewRetweetedRecord) {
          quote.quotedRecord = null;
        }

        return quote;
      }),
    );
  }

  public async getUserQuotes(userId: string, currentUser: User): Promise<Quote[]> {
    const abilityToViewRecords = await this.recordPermissionsService.defineCurrentUserAbilityToViewUserRecordsOrThrow({
      currentUser,
      target: { id: userId } as User,
    });

    const quotes = await this.recordRepository.findQuotesByAuthorIdOrThrow(userId);

    const quotesAllowedToView = quotes.filter((quote) => abilityToViewRecords.can('view', quote));

    await this.nullifyQuotesQuotedRecordsCurrentUserCannotView(quotesAllowedToView, currentUser);

    return quotesAllowedToView;
  }

  public async getQuotesByAuthorIds(ids: string[], currentUser: User): Promise<Quote[]> {
    const quotes = await this.recordRepository.findQuotesByAuthorIds(ids);

    const quotesAllowedToView = await asyncFilter(quotes, async (quote) => {
      return this.recordPermissionsService.canCurrentUserViewRecord(currentUser, quote);
    });

    await this.nullifyQuotesQuotedRecordsCurrentUserCannotView(quotesAllowedToView, currentUser);

    return quotesAllowedToView;
  }

  public async deleteQuoteById(id: string, currentUser: User): Promise<Quote> {
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
  ): Promise<Quote> {
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
