import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '../users/users.module';

import { TwitterRecordImage } from './entities/twitter-record-image.entity';
import { TwitterRecord } from './entities/twitter-record.entity';
import { RecordImagesMapper } from './mappers/record-images.mapper';
import { TwitterRecordRepository } from './repositories/twitter-record.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TwitterRecord, TwitterRecordImage]), UsersModule],
  providers: [TwitterRecordRepository, RecordImagesMapper],
  exports: [TwitterRecordRepository, RecordImagesMapper],
})
export class TwitterRecordModule {}
