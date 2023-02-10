import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RecordLikesModule } from '../record-likes/record-likes.module';
import { RecordPermissionsModule } from '../record-permissions/record-permissions.module';
import { TwitterRecordModule } from '../twitter-record/twitter-record.module';
import { UserFollowingsModule } from '../user-followings/user-followings.module';
import { UsersModule } from '../users/users.module';

import { UserProfileController } from './controllers/user-profile.controller';
import { UserProfile } from './entities/user-profile.entity';
import { UserEventsSubscriber } from './events-subscribers/user.events-subscriber';
import { UserProfileRepository } from './repository/user-profile.repository';
import { UserProfileService } from './services/user-profile.service';

@Module({
  controllers: [UserProfileController],
  imports: [
    TypeOrmModule.forFeature([UserProfile]),
    UsersModule,
    TwitterRecordModule,
    RecordPermissionsModule,
    UserFollowingsModule,
    RecordLikesModule,
  ],
  providers: [UserProfileService, UserProfileRepository, UserEventsSubscriber],
  exports: [UserProfileService],
})
export class UserProfileModule {}
