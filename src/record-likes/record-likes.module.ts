import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TwitterRecordModule } from '../twitter-record/twitter-record.module';

import { RecordLikesController } from './controllers/record-likes.controller';
import { RecordLike } from './entities/record-like.entity';
import { RecordLikeRepository } from './repositories/record-like.repository';
import { RecordLikesService } from './services/record-likes.service';

@Module({
  controllers: [RecordLikesController],
  imports: [TypeOrmModule.forFeature([RecordLike]), TwitterRecordModule],
  providers: [RecordLikesService, RecordLikeRepository],
})
export class RecordLikesModule {}
