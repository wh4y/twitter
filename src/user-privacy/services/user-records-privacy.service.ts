import { Injectable } from '@nestjs/common';

import { ActionForbiddenException } from '../../record-permissions/exceptions/action-forbidden.exception';
import { User } from '../../users/entities/user.entity';
import { UserRecordsPrivacySettings } from '../entities/user-records-privacy-settings.entity';
import { UserRecordsPrivacySettingsRepository } from '../repositories/user-records-privacy-settings.repository';

import { UpdateUserRecordsPrivacySettingsOptions } from './user-records-privacy-service.options';

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

  public async updateUserRecordsPrivacySettings(
    userId: string,
    options: UpdateUserRecordsPrivacySettingsOptions,
    currentUser: User,
  ): Promise<void> {
    const isCurrentUserAllowedToUpdateSettings = userId === currentUser.id;

    if (!isCurrentUserAllowedToUpdateSettings) {
      throw new ActionForbiddenException();
    }

    await this.usersRecordsPrivacySettingsRepository.updateByRecordIdOrThrow(userId, {
      ...options,
      usersExceptedFromCommentingRules: this.constructUsersFromUserIds(options.idsOfUsersExceptedFromCommentingRules),
      usersExceptedFromViewingRules: this.constructUsersFromUserIds(options.idsOfUsersExceptedFromViewingRules),
    });
  }

  private constructUsersFromUserIds(ids: string[]): User[] | undefined {
    if (!ids) {
      return undefined;
    }

    return ids.map((id) => new User({ id }));
  }
}
