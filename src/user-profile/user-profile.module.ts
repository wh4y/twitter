import { Module } from '@nestjs/common';

import { RecordLikesModule } from '../record-likes/record-likes.module';
import { RecordPermissionsModule } from '../record-permissions/record-permissions.module';
import { TwitterRecordModule } from '../twitter-record/twitter-record.module';
import { UserFollowingsModule } from '../user-followings/user-followings.module';

import { UserProfileController } from './controllers/user-profile.controller';
import { UserProfileService } from './services/user-profile.service';

@Module({
  controllers: [UserProfileController],
  imports: [TwitterRecordModule, RecordPermissionsModule, UserFollowingsModule, RecordLikesModule],
  providers: [UserProfileService],
})
export class UserProfileModule {}
