import { Injectable } from '@nestjs/common';

import { asyncFilter } from 'common/array-utils';
import { Paginated, PaginationOptions } from 'common/pagination';

import { RecordPermissionsService } from '../../record-permissions/services/record-permissions.service';
import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { TwitterRecordRepository } from '../../twitter-record/repositories/twitter-record.repository';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class UserProfileService {
  constructor(
    private readonly recordRepository: TwitterRecordRepository,
    private readonly recordPermissionsService: RecordPermissionsService,
  ) {}

  public async getUserRecords(
    userId: string,
    currentUser: User,
    paginationOptions: PaginationOptions,
  ): Promise<Paginated<TwitterRecord>> {
    const { data: records, ...paginationMetadata } = await this.recordRepository.findRecordsByAuthorIdOrThrow(
      userId,
      paginationOptions,
    );

    const recordsAllowedToView = await asyncFilter(records, async (record) => {
      return this.recordPermissionsService.canCurrentUserViewRecord(currentUser, record);
    });

    return { data: recordsAllowedToView, ...paginationMetadata };
  }
}
