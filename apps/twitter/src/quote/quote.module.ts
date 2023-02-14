import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { TwitterRecordModule } from '../twitter-record/twitter-record.module';

import { QUOTE_IMAGES_DESTINATION } from './constants/quote-images-destination.constant';
import { QuoteController } from './controllers/quote.controller';
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
  providers: [QuoteService],
  exports: [QuoteService],
})
export class QuoteModule {}
