import { createMap, forMember, mapFrom, Mapper, mapWith } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';

import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { Retweet } from '../entities/retweet.entity';
import { RetweetedRecord } from '../entities/retweeted-record.entity';

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
        forMember(
          (retweet) => retweet.retweetedRecord,
          mapWith(RetweetedRecord, TwitterRecord, (record) => record.parentRecord),
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
        forMember(
          (record) => record.parentRecord,
          mapWith(TwitterRecord, RetweetedRecord, (retweet) => retweet.retweetedRecord),
        ),
      );
    };
  }
}
