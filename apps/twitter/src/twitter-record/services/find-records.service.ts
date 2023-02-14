import { Injectable } from '@nestjs/common';

import { asyncFilter } from 'common/array-utils';
import { Paginated, PaginationOptions } from 'common/pagination';
import { SortOptions } from 'common/sort';

import { RecordPermissionsService } from '../../record-permissions/services/record-permissions.service';
import { User } from '../../users/entities/user.entity';
import { TwitterRecord } from '../entities/twitter-record.entity';
import { RecordsSortType } from '../enums/records-sort-type.enum';
import { TwitterRecordRepository } from '../repositories/twitter-record.repository';

import { RecordsFiltrationOptions } from './find-records-service.options';

@Injectable()
export class FindRecordsService {
  constructor(
    private readonly recordRepository: TwitterRecordRepository,
    private readonly recordPermissionsService: RecordPermissionsService,
  ) {}

  public async getAllRecords(
    filtrationOptions: RecordsFiltrationOptions,
    paginationOptions: PaginationOptions,
    sortOptions: SortOptions<RecordsSortType>,
    currentUser: User,
  ): Promise<Paginated<TwitterRecord>> {
    const { data: records, ...paginationMetadata } = await this.recordRepository.findManyRecords(
      filtrationOptions,
      paginationOptions,
      sortOptions,
    );

    const recordsAllowedToView = await this.filterRecordsAvailableForCurrentUser(records, currentUser);

    const recordsWithParentRecordAllowedToView = await this.nullifyUnavailableForCurrentUserParentRecordsOfRecords(
      recordsAllowedToView,
      currentUser,
    );

    return { data: recordsWithParentRecordAllowedToView, ...paginationMetadata };
  }

  public async getRecordsByAuthorId(
    authorId: string,
    filtrationOptions: RecordsFiltrationOptions,
    paginationOptions: PaginationOptions,
    sortOptions: SortOptions<RecordsSortType>,
    currentUser: User,
  ): Promise<Paginated<TwitterRecord>> {
    const { data: records, ...paginationMetadata } = await this.recordRepository.findRecordsByAuthorIdOrThrow(
      authorId,
      filtrationOptions,
      paginationOptions,
      sortOptions,
    );

    const recordsAllowedToView = await this.filterAuthorRecordsAvailableForCurrentUser(authorId, records, currentUser);

    const recordsWithParentRecordAllowedToView = await this.nullifyUnavailableForCurrentUserParentRecordsOfRecords(
      recordsAllowedToView,
      currentUser,
    );

    return { data: recordsWithParentRecordAllowedToView, ...paginationMetadata };
  }

  public async getRecordsByAuthorIds(
    authorIds: string[],
    filtrationOptions: RecordsFiltrationOptions,
    paginationOptions: PaginationOptions,
    sortOptions: SortOptions<RecordsSortType>,
    currentUser: User,
  ): Promise<Paginated<TwitterRecord>> {
    const { data: records, ...paginationMetadata } = await this.recordRepository.findRecordsByAuthorIds(
      authorIds,
      filtrationOptions,
      paginationOptions,
      sortOptions,
    );

    const recordsAllowedToView = await this.filterRecordsAvailableForCurrentUser(records, currentUser);

    const recordsWithParentRecordAllowedToView = await this.nullifyUnavailableForCurrentUserParentRecordsOfRecords(
      recordsAllowedToView,
      currentUser,
    );

    return { data: recordsWithParentRecordAllowedToView, ...paginationMetadata };
  }

  public async getRecordsByIds(
    recordIds: string[],
    filtrationOptions: RecordsFiltrationOptions,
    paginationOptions: PaginationOptions,
    sortOptions: SortOptions<RecordsSortType>,
    currentUser: User,
  ): Promise<Paginated<TwitterRecord>> {
    const { data: records, ...paginationMetadata } = await this.recordRepository.findRecordsByIds(
      recordIds,
      filtrationOptions,
      paginationOptions,
      sortOptions,
    );

    const recordsAllowedToView = await this.filterRecordsAvailableForCurrentUser(records, currentUser);

    const recordsWithParentRecordAllowedToView = await this.nullifyUnavailableForCurrentUserParentRecordsOfRecords(
      recordsAllowedToView,
      currentUser,
    );

    return { data: recordsWithParentRecordAllowedToView, ...paginationMetadata };
  }

  private async filterAuthorRecordsAvailableForCurrentUser(
    authorId: string,
    records: TwitterRecord[],
    currentUser: User,
  ): Promise<TwitterRecord[]> {
    const abilityToViewRecords = await this.recordPermissionsService.defineCurrentUserAbilityToViewAuthorRecordsOrThrow({
      author: { id: authorId } as User,
      currentUser,
    });

    const recordsAllowedToView = await asyncFilter(records, async (record) => {
      return abilityToViewRecords.can('view', record);
    });

    return recordsAllowedToView;
  }

  private async filterRecordsAvailableForCurrentUser(records: TwitterRecord[], currentUser: User): Promise<TwitterRecord[]> {
    const recordsAllowedToView = await asyncFilter(records, async (record) => {
      return this.recordPermissionsService.canCurrentUserViewRecord(currentUser, record);
    });

    return recordsAllowedToView;
  }

  private async nullifyUnavailableForCurrentUserParentRecordsOfRecords(
    records: TwitterRecord[],
    currentUser: User,
  ): Promise<TwitterRecord[]> {
    return Promise.all(
      records.map(async (record) => {
        if (!record.parentRecord) {
          return record;
        }

        const canCurrentUserViewParentRecord = await this.recordPermissionsService.canCurrentUserViewRecord(currentUser, record);

        if (!canCurrentUserViewParentRecord) {
          record.parentRecord = null;
        }

        return record;
      }),
    );
  }
}
