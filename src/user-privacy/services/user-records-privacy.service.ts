import { Injectable } from '@nestjs/common';

import { UserRecordsPrivacySettings } from '../entities/user-records-privacy-settings.entity';
import { UserRecordsPrivacySettingsRepository } from '../repositories/user-records-privacy-settings.repository';

@Injectable()
export class UserRecordsPrivacyService {
  constructor(private readonly usersRecordsPrivacySettingsRepository: UserRecordsPrivacySettingsRepository) {}

  public async defineDefaultUserRecordsPrivacySettingsForUser(userId: string): Promise<void> {
    const settings = new UserRecordsPrivacySettings({ userId });

    await this.usersRecordsPrivacySettingsRepository.save(settings);
  }

  public async findUserRecordsPrivacySettings(userId: string): Promise<UserRecordsPrivacySettings> {
    return this.usersRecordsPrivacySettingsRepository.findByUserIdOrThrow(userId);
  }
}
