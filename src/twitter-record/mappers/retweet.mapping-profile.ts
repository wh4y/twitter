import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';

import { Retweet } from '../entities/retweet.entity';
import { TwitterRecord } from '../entities/twitter-record.entity';

export class RetweetMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  public override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        TwitterRecord,
        Retweet,
        forMember(
          (retweet) => retweet.retweetedRecordId,
          mapFrom((record) => record.parentRecordId),
        ),
      );
      createMap(
        mapper,
        Retweet,
        TwitterRecord,
        forMember(
          (record) => record.parentRecordId,
          mapFrom((retweet) => retweet.retweetedRecordId),
        ),
      );
    };
  }
}
