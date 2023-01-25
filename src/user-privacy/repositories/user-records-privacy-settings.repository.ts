import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserNotExistException } from '../../users/exceptions/user-not-exist.exception';
import { UsersRepository } from '../../users/repositories/users.repository';
import { UserRecordsPrivacySettings } from '../entities/user-records-privacy-settings.entity';

@Injectable()
export class UserRecordsPrivacySettingsRepository {
  constructor(
    @InjectRepository(UserRecordsPrivacySettings) private readonly typeormRepository: Repository<UserRecordsPrivacySettings>,
    private readonly usersRepository: UsersRepository,
  ) {}

  public async save(settings: UserRecordsPrivacySettings): Promise<void> {
    const doesUserExist = await this.usersRepository.checkIfUserExistsById(settings.userId);

    if (!doesUserExist) {
      throw new UserNotExistException();
    }

    await this.typeormRepository.save(settings);
  }

  public async findByUserIdOrThrow(userId: string): Promise<UserRecordsPrivacySettings> {
    const doesUserExist = await this.usersRepository.checkIfUserExistsById(userId);

    if (!doesUserExist) {
      throw new UserNotExistException();
    }

    return this.typeormRepository.findOne({
      where: { userId },
      relations: {
        usersExceptedFromCommentingRules: true,
        usersExceptedFromViewingRules: true,
      },
    });
  }
}
