import { Module } from '@nestjs/common';

import { UserFollowingsModule } from '../user-followings/user-followings.module';
import { UserPrivacyModule } from '../user-privacy/user-privacy.module';

import { RecordPermissionsService } from './services/record-permissions.service';

@Module({
  imports: [UserPrivacyModule, UserFollowingsModule],
  providers: [RecordPermissionsService],
  exports: [RecordPermissionsService],
})
export class RecordPermissionsModule {}
