import { afterMap, condition, createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';

import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { QuotedRecord } from '../entities/quoted-record.entity';

export class QuotedRecordMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  public override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        TwitterRecord,
        QuotedRecord,
        forMember(
          (retweetedRecord) => retweetedRecord.isDeleted,
          condition((record) => record.isComment === true),
        ),
        forMember(
          (quotedRecord) => quotedRecord.commentedRecordId,
          mapFrom((record) => record.parentRecordId),
        ),
        forMember(
          (quotedRecord) => quotedRecord.quotedRecordId,
          mapFrom((record) => record.parentRecordId),
        ),
        afterMap((record, quotedRecord) => {
          if (record.isComment === false) {
            delete quotedRecord.commentedRecordId;
          }

          if (record.isQuote === false) {
            delete quotedRecord.quotedRecordId;
          }
        }),
      );
      createMap(
        mapper,
        QuotedRecord,
        TwitterRecord,
        forMember(
          (record) => record.parentRecordId,
          mapFrom((quotedRecord) => quotedRecord.commentedRecordId),
        ),
      );
    };
  }
}
