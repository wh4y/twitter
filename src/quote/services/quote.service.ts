import { ForbiddenError } from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { ActionForbiddenException } from '../../record-permissions/exceptions/action-forbidden.exception';
import { RecordPermissionsService } from '../../record-permissions/services/record-permissions.service';
import { RecordPrivacySettings } from '../../record-privacy/entities/record-privacy-settings.entity';
import { TwitterRecordRepository } from '../../twitter-record/repositories/twitter-record.repository';
import { User } from '../../users/entities/user.entity';
import { Quote } from '../entities/quote.entity';
import { QuotedRecord } from '../entities/quoted-record.entity';

import { QuoteContentOptions } from './quote-service.options';

@Injectable()
export class QuoteService {
  constructor(
    private readonly recordRepository: TwitterRecordRepository,
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

  public async getUserQuotes(userId: string, currentUser: User): Promise<Quote[]> {
    const abilityToViewRecords = await this.recordPermissionsService.defineCurrentUserAbilityToViewUserRecords({
      currentUser,
      target: { id: userId } as User,
    });

    const quotes = await this.recordRepository.findQuotesByAuthorIdOrThrow(userId);

    const quotesAllowedToBeViewed = quotes.filter((quote) => abilityToViewRecords.can('view', quote));
    const quotesWithQuotedRecordAllowedToBeViewed = Promise.all(
      quotesAllowedToBeViewed.map(async (quote) => {
        if (quote.quotedRecord === null) {
          return quote;
        }

        const canCurrentUserViewRetweetedRecord = await this.canCurrentUserQuotedRecord(currentUser, quote.quotedRecord);

        if (!canCurrentUserViewRetweetedRecord) {
          quote.quotedRecord = null;
        }

        return quote;
      }),
    );

    return quotesWithQuotedRecordAllowedToBeViewed;
  }

  private async canCurrentUserQuotedRecord(currentUser: User, record: QuotedRecord): Promise<boolean> {
    try {
      const abilityToViewUserRecords = await this.recordPermissionsService.defineCurrentUserAbilityToViewUserRecords({
        currentUser,
        target: { id: record.authorId } as User,
      });

      return abilityToViewUserRecords.can('view', record);
    } catch (e) {
      if (e instanceof ActionForbiddenException) {
        return false;
      }

      throw e;
    }
  }

  public async deleteQuoteById(id: string, currentUser: User): Promise<Quote> {
    const quote = await this.recordRepository.findQuoteByIdOrThrow(id);

    const abilityToManageRecords = await this.recordPermissionsService.defineAbilityToManageRecordsFor(currentUser);

    ForbiddenError.from(abilityToManageRecords).throwUnlessCan('delete', quote);

    await this.recordRepository.deleteByIdOrThrow(id);

    return quote;
  }
}
