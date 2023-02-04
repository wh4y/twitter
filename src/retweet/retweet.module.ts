import { Module } from '@nestjs/common';

import { TwitterRecordModule } from '../twitter-record/twitter-record.module';

import { RetweetController } from './controllers/retweet.controller';
import { RetweetMappingProfile } from './mappers/retweet.mapping-profile';
import { RetweetedRecordMappingProfile } from './mappers/retweeted-record.mapping-profile';
import { RetweetService } from './services/retweet.service';

@Module({
  controllers: [RetweetController],
  imports: [TwitterRecordModule],
  providers: [RetweetService, RetweetMappingProfile, RetweetedRecordMappingProfile],
  exports: [RetweetService],
})
export class RetweetModule {}
