import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '../users/users.module';

import { CommentController } from './controllers/comment.controller';
import { RetweetController } from './controllers/retweet.controller';
import { TweetController } from './controllers/tweet.controller';
import { TwitterRecordImage } from './entities/twitter-record-image.entity';
import { TwitterRecord } from './entities/twitter-record.entity';
import { CommentMappingProfile } from './mappers/comment.mapping-profile';
import { RecordImagesMapper } from './mappers/record-images.mapper';
import { RetweetMappingProfile } from './mappers/retweet.mapping-profile';
import { TweetMappingProfile } from './mappers/tweet.mapping-profile';
import { TwitterRecordRepository } from './repositories/twitter-record.repository';
import { CommentService } from './services/comment/comment.service';
import { RetweetService } from './services/retweet/retweet.service';
import { TweetService } from './services/tweet/tweet.service';

@Module({
  controllers: [TweetController, CommentController, RetweetController],
  imports: [TypeOrmModule.forFeature([TwitterRecord, TwitterRecordImage]), UsersModule],
  providers: [
    TwitterRecordRepository,
    RecordImagesMapper,
    TweetService,
    TweetMappingProfile,
    CommentService,
    CommentMappingProfile,
    RetweetService,
    RetweetMappingProfile,
  ],
})
export class TwitterRecordModule {}
