import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileModule, FileService } from 'common/file';

import { CommentController } from '../comment/controllers/comment.controller';
import { CommentService } from '../comment/services/comment.service';
import { RecordPermissionsModule } from '../record-permissions/record-permissions.module';
import { RecordPrivacyModule } from '../record-privacy/record-privacy.module';
import { RetweetController } from '../retweet/controllers/retweet.controller';
import { RetweetService } from '../retweet/services/retweet.service';
import { UserPrivacyModule } from '../user-privacy/user-privacy.module';
import { UsersModule } from '../users/users.module';

import { TwitterRecordImage } from './entities/twitter-record-image.entity';
import { TwitterRecord } from './entities/twitter-record.entity';
import { RecordImagesMapper } from './mappers/record-images.mapper';
import { RecordImageRepository } from './repositories/record-image.repository';
import { TwitterRecordRepository } from './repositories/twitter-record.repository';
import { FindRecordsService } from './services/find-records.service';

@Module({
  controllers: [CommentController, RetweetController],
  imports: [
    TypeOrmModule.forFeature([TwitterRecord, TwitterRecordImage]),
    UsersModule,
    UserPrivacyModule,
    RecordPermissionsModule,
    FileModule,
    forwardRef(() => RecordPrivacyModule),
  ],
  providers: [TwitterRecordRepository, RecordImageRepository, RecordImagesMapper, CommentService, RetweetService, FindRecordsService],
  exports: [
    TwitterRecordRepository,
    FindRecordsService,
    RecordImageRepository,
    RecordPermissionsModule,
    RecordImagesMapper,
    UsersModule,
  ],
})
export class TwitterRecordModule {}
