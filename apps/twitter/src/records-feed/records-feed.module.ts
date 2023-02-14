import { Module } from '@nestjs/common';

import { RecordPermissionsModule } from '../record-permissions/record-permissions.module';
import { TwitterRecordModule } from '../twitter-record/twitter-record.module';
import { UserFollowingsModule } from '../user-followings/user-followings.module';

import { RecordsFeedController } from './controllers/records-feed.controller';
import { RecordsFeedService } from './services/records-feed.service';

@Module({
  controllers: [RecordsFeedController],
  imports: [TwitterRecordModule, RecordPermissionsModule, UserFollowingsModule],
  providers: [RecordsFeedService],
})
export class RecordsFeedModule {}
