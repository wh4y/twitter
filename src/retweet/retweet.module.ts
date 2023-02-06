import { Module } from '@nestjs/common';

import { TwitterRecordModule } from '../twitter-record/twitter-record.module';

import { RetweetController } from './controllers/retweet.controller';
import { RetweetService } from './services/retweet.service';

@Module({
  controllers: [RetweetController],
  imports: [TwitterRecordModule],
  providers: [RetweetService],
  exports: [RetweetService],
})
export class RetweetModule {}
