import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { TwitterRecordModule } from '../twitter-record/twitter-record.module';

import { COMMENT_IMAGES_DESTINATION } from './constants/comment-images-destination.constant';
import { CommentController } from './controllers/comment.controller';
import { CommentMappingProfile } from './mappers/comment.mapping-profile';
import { CommentService } from './services/comment.service';

@Module({
  controllers: [CommentController],
  imports: [
    TwitterRecordModule,
    ServeStaticModule.forRoot({
      rootPath: './upload',
      serveRoot: COMMENT_IMAGES_DESTINATION,
      serveStaticOptions: {
        index: false,
      },
    }),
  ],
  providers: [CommentService, CommentMappingProfile],
})
export class CommentModule {}
