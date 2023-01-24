import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';

import { Tweet } from '../entities/tweet.entity';
import { TwitterRecord } from '../entities/twitter-record.entity';

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
