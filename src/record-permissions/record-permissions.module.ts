import { Module } from '@nestjs/common';

import { UserPrivacyModule } from '../user-privacy/user-privacy.module';

import { RecordPermissionsService } from './services/record-permissions.service';

@Module({
  imports: [UserPrivacyModule],
  providers: [RecordPermissionsService],
  exports: [RecordPermissionsService],
})
export class RecordPermissionsModule {}
