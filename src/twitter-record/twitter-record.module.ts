import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommentController } from '../comment/controllers/comment.controller';
import { CommentMappingProfile } from '../comment/mappers/comment.mapping-profile';
import { CommentService } from '../comment/services/comment.service';
import { RecordPermissionsModule } from '../record-permissions/record-permissions.module';
import { RecordPrivacyModule } from '../record-privacy/record-privacy.module';
import { RetweetController } from '../retweet/controllers/retweet.controller';
import { RetweetMappingProfile } from '../retweet/mappers/retweet.mapping-profile';
import { RetweetService } from '../retweet/services/retweet.service';
import { UserPrivacyModule } from '../user-privacy/user-privacy.module';
import { UsersModule } from '../users/users.module';

import { TwitterRecordImage } from './entities/twitter-record-image.entity';
import { TwitterRecord } from './entities/twitter-record.entity';
import { RecordImagesMapper } from './mappers/record-images.mapper';
import { TwitterRecordRepository } from './repositories/twitter-record.repository';

@Module({
  controllers: [CommentController, RetweetController],
  imports: [
    TypeOrmModule.forFeature([TwitterRecord, TwitterRecordImage]),
    UsersModule,
    UserPrivacyModule,
    RecordPermissionsModule,
    forwardRef(() => RecordPrivacyModule),
  ],
  providers: [
    TwitterRecordRepository,
    RecordImagesMapper,
    CommentService,
    CommentMappingProfile,
    RetweetService,
    RetweetMappingProfile,
  ],
  exports: [TwitterRecordRepository, RecordPermissionsModule, RecordImagesMapper, UsersModule],
})
export class TwitterRecordModule {}
