import { Module } from '@nestjs/common';

import { TwitterRecordModule } from '../twitter-record/twitter-record.module';

import { RetweetMappingProfile } from './mappers/retweet.mapping-profile';
import { RetweetService } from './services/retweet.service';

@Module({
  controllers: [],
  imports: [TwitterRecordModule],
  providers: [RetweetService, RetweetMappingProfile],
})
export class RetweetModule {}
