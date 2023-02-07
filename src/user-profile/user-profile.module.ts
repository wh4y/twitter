import { Module } from '@nestjs/common';

import { RecordPermissionsModule } from '../record-permissions/record-permissions.module';
import { TwitterRecordModule } from '../twitter-record/twitter-record.module';
import { UserFollowingsModule } from '../user-followings/user-followings.module';

import { UserProfileController } from './controllers/user-profile.controller';
import { UserProfileService } from './services/user-profile.service';

@Module({
  controllers: [UserProfileController],
  imports: [TwitterRecordModule, RecordPermissionsModule, UserFollowingsModule],
  providers: [UserProfileService],
})
export class UserProfileModule {}
