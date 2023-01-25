import { Injectable } from '@nestjs/common';

import { User } from '../../users/entities/user.entity';
import { RecordPrivacySettings } from '../entities/record-privacy-settings.entity';
import { RecordPrivacySettingsRepository } from '../repositories/record-privacy-settings.repository';

import { UpdateRecordPrivacySettingsOptions } from './records-privacy-service.options';

@Injectable()
export class RecordsPrivacyService {
  constructor(private readonly recordPrivacySettingsRepository: RecordPrivacySettingsRepository) {}

  public async updateRecordPrivacySettings(recordId: string, options: UpdateRecordPrivacySettingsOptions): Promise<void> {
    await this.recordPrivacySettingsRepository.updateByRecordIdOrThrow(recordId, {
      ...options,
      usersExceptedFromCommentingRules: this.constructUsersFromUserIds(options.idsOfUsersExceptedFromCommentingRules),
      usersExceptedFromViewingRules: this.constructUsersFromUserIds(options.idsOfUsersExceptedFromViewingRules),
    });
  }

  public async getRecordPrivacySettings(recordId: string): Promise<RecordPrivacySettings> {
    return this.recordPrivacySettingsRepository.findRecordPrivacySettingsByRecordIdOrThrow(recordId);
  }

  public async getRecordsPrivacySettings(recordIds: string[]): Promise<RecordPrivacySettings[]> {
    return this.recordPrivacySettingsRepository.findRecordsPrivacySettingsByRecordIds(recordIds);
  }

  private constructUsersFromUserIds(ids: string[]): User[] | undefined {
    if (!ids) {
      return undefined;
    }

    return ids.map((id) => new User({ id }));
  }
}
