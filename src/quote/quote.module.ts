import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { TwitterRecordModule } from '../twitter-record/twitter-record.module';

import { QUOTE_IMAGES_DESTINATION } from './constants/quote-images-destination.constant';
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
      serveRoot: QUOTE_IMAGES_DESTINATION,
      serveStaticOptions: {
        index: false,
      },
    }),
  ],
  providers: [QuoteService, QuoteMappingProfile, QuotedRecordMappingProfile],
  exports: [QuoteService],
})
export class QuoteModule {}
