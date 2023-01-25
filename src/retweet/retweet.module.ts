import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { TwitterRecordModule } from '../twitter-record/twitter-record.module';

import { RetweetController } from './controllers/retweet.controller';
import { RetweetMappingProfile } from './mappers/retweet.mapping-profile';
import { RetweetService } from './services/retweet.service';

@Module({
  controllers: [RetweetController],
  imports: [
    TwitterRecordModule,
    ServeStaticModule.forRoot({
      rootPath: './upload',
      serveRoot: '/comment',
      serveStaticOptions: {
        index: false,
      },
    }),
  ],
  providers: [RetweetService, RetweetMappingProfile],
})
export class RetweetModule {}
