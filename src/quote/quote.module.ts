import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { TwitterRecordModule } from '../twitter-record/twitter-record.module';

import { QuoteController } from './controllers/quote.controller';
import { QuoteMappingProfile } from './mappers/quote.mapping-profile';
import { QuotedRecordMappingProfile } from './mappers/quoted-record.mapping-profile';
import { QuoteService } from './services/quote.service';

@Module({
  controllers: [QuoteController],
  imports: [
    TwitterRecordModule,
    ServeStaticModule.forRoot({
      rootPath: './upload',
      serveRoot: '/quote',
      serveStaticOptions: {
        index: false,
      },
    }),
  ],
  providers: [QuoteService, QuoteMappingProfile, QuotedRecordMappingProfile],
  exports: [QuoteService],
})
export class QuoteModule {}
