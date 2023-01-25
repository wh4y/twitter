import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TwitterRecordModule } from '../twitter-record/twitter-record.module';
import { UsersModule } from '../users/users.module';

import { RecordsPrivacyController } from './controllers/records-privacy.controller';
import { RecordPrivacySettings } from './entities/record-privacy-settings.entity';
import { RecordPrivacySettingsRepository } from './repositories/record-privacy-settings.repository';
import { RecordsPrivacyService } from './services/records-privacy.service';

@Module({
  controllers: [RecordsPrivacyController],
  imports: [forwardRef(() => TwitterRecordModule), UsersModule, TypeOrmModule.forFeature([RecordPrivacySettings])],
  providers: [RecordsPrivacyService, RecordPrivacySettingsRepository],
  exports: [RecordsPrivacyService],
})
export class RecordPrivacyModule {}
