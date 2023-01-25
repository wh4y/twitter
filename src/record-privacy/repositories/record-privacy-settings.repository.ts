import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';

import { RecordNotExistException } from '../../twitter-record/exceptions/record-not-exist.exception';
import { TwitterRecordRepository } from '../../twitter-record/repositories/twitter-record.repository';
import { RecordPrivacySettings } from '../entities/record-privacy-settings.entity';

@Injectable()
export class RecordPrivacySettingsRepository {
  constructor(
    @InjectRepository(RecordPrivacySettings) private readonly typeormRepository: Repository<RecordPrivacySettings>,
    private readonly twitterRecordRepository: TwitterRecordRepository,
  ) {}

  public async save(recordPrivacySettings: RecordPrivacySettings): Promise<void> {
    await this.typeormRepository.save(recordPrivacySettings);
  }

  public async updateByRecordIdOrThrow(recordId: string, options: DeepPartial<RecordPrivacySettings>): Promise<void> {
    const recordPrivacySettings = await this.findRecordPrivacySettingsByRecordIdOrThrow(recordId);

    Object.assign(recordPrivacySettings, { ...options });

    await this.typeormRepository.save(recordPrivacySettings);
  }

  public async findRecordPrivacySettingsByRecordIdOrThrow(recordId: string): Promise<RecordPrivacySettings> {
    const doesRecordExist = await this.twitterRecordRepository.checkIfRecordExistsById(recordId);

    if (!doesRecordExist) {
      throw new RecordNotExistException();
    }

    return this.typeormRepository.findOne({
      where: { recordId },
      relations: {
        usersExceptedFromViewingRules: true,
        usersExceptedFromCommentingRules: true,
      },
    });
  }

  public async findRecordsPrivacySettingsByRecordIds(recordIds: string[]): Promise<RecordPrivacySettings[]> {
    return this.typeormRepository.find({
      where: { recordId: In(recordIds) },
      relations: {
        usersExceptedFromViewingRules: true,
        usersExceptedFromCommentingRules: true,
      },
    });
  }
}
