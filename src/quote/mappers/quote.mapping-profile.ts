import { createMap, forMember, mapFrom, Mapper, mapWith } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';

import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { Quote } from '../entities/quote.entity';
import { QuotedRecord } from '../entities/quoted-record.entity';

export class QuoteMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  public override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        TwitterRecord,
        Quote,
        forMember(
          (quote) => quote.quotedRecordId,
          mapFrom((record) => record.parentRecordId),
        ),
        forMember(
          (quote) => quote.quotedRecord,
          mapWith(QuotedRecord, TwitterRecord, (record) => record.parentRecord),
        ),
      );
      createMap(
        mapper,
        Quote,
        TwitterRecord,
        forMember(
          (record) => record.parentRecordId,
          mapFrom((quote) => quote.quotedRecordId),
        ),
        forMember(
          (record) => record.parentRecord,
          mapWith(TwitterRecord, QuotedRecord, (quote) => quote.quotedRecord),
        ),
      );
    };
  }
}
