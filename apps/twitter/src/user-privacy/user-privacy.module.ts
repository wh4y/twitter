import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '../users/users.module';

import { UserPrivacyController } from './controllers/user-privacy.controller';
import { UserRecordsPrivacySettings } from './entities/user-records-privacy-settings.entity';
import { UserEventsSubscriber } from './events-subsrcibers/user.events-subscriber';
import { UserRecordsPrivacySettingsRepository } from './repositories/user-records-privacy-settings.repository';
import { UserRecordsPrivacyService } from './services/user-records-privacy.service';

@Module({
  controllers: [UserPrivacyController],
  imports: [UsersModule, TypeOrmModule.forFeature([UserRecordsPrivacySettings])],
  providers: [UserRecordsPrivacySettingsRepository, UserRecordsPrivacyService, UserEventsSubscriber],
  exports: [UserRecordsPrivacyService],
})
export class UserPrivacyModule {}
