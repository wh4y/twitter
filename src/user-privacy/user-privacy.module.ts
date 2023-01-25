import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '../users/users.module';

import { UserRecordsPrivacySettings } from './entities/user-records-privacy-settings.entity';
import { UserRecordsPrivacySettingsRepository } from './repositories/user-records-privacy-settings.repository';
import { UserRecordsPrivacyService } from './services/user-records-privacy.service';

@Module({
  imports: [forwardRef(() => UsersModule), TypeOrmModule.forFeature([UserRecordsPrivacySettings])],
  providers: [UserRecordsPrivacySettingsRepository, UserRecordsPrivacyService],
  exports: [UserRecordsPrivacyService],
})
export class UserPrivacyModule {}
