import { Module } from '@nestjs/common';

import { TwitterRecordModule } from '../twitter-record/twitter-record.module';

import { CommentController } from './controllers/comment.controller';
import { CommentMappingProfile } from './mappers/comment.mapping-profile';
import { CommentService } from './services/comment.service';

@Module({
  controllers: [CommentController],
  imports: [TwitterRecordModule],
  providers: [CommentService, CommentMappingProfile],
})
export class CommentModule {}
