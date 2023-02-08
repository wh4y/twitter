import { Module } from '@nestjs/common';

import { TwitterRecordModule } from '../twitter-record/twitter-record.module';

@Module({
  controllers: [],
  imports: [TwitterRecordModule],
  providers: [],
})
export class RecordsExploreModule {}
