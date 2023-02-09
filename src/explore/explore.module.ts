import { Module } from '@nestjs/common';

import { TwitterRecordModule } from '../twitter-record/twitter-record.module';
import { UserProfileModule } from '../user-profile/user-profile.module';

import { ExploreController } from './controllers/explore.controller';
import { ExploreService } from './services/explore.service';

@Module({
  controllers: [ExploreController],
  imports: [TwitterRecordModule, UserProfileModule],
  providers: [ExploreService],
})
export class ExploreModule {}
