import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';

import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { Tweet } from '../entities/tweet.entity';

export class TweetMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  public override get profile() {
    return (mapper) => {
      createMap(mapper, TwitterRecord, Tweet);
      createMap(mapper, Tweet, TwitterRecord);
    };
  }
}
