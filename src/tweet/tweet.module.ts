import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';

import { TwitterRecordModule } from '../twitter-record/twitter-record.module';

import { TweetController } from './controllers/tweet.controller';
import { TweetMappingProfile } from './mappers/tweet.mapping-profile';
import { TweetService } from './services/tweet.service';

@Module({
  controllers: [TweetController],
  imports: [
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    TwitterRecordModule,
  ],
  providers: [TweetService, TweetMappingProfile],
})
export class TweetModule {}
