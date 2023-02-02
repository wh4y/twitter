import { afterMap, condition, createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';

import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { RetweetedRecord } from '../entities/retweeted-record.entity';

export class RetweetedRecordMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  public override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        TwitterRecord,
        RetweetedRecord,
        forMember(
          (retweetedRecord) => retweetedRecord.isDeleted,
          condition((record) => record.isComment === true),
        ),
        forMember(
          (retweetedRecord) => retweetedRecord.commentedRecordId,
          mapFrom((record) => record.parentRecordId),
        ),
        forMember(
          (retweetedRecord) => retweetedRecord.quotedRecordId,
          mapFrom((record) => record.parentRecordId),
        ),
        afterMap((record, retweetedRecord) => {
          if (record.isComment === false) {
            delete retweetedRecord.commentedRecordId;
          }

          if (record.isQuote === false) {
            delete retweetedRecord.quotedRecordId;
          }
        }),
      );
      createMap(
        mapper,
        RetweetedRecord,
        TwitterRecord,
        forMember(
          (record) => record.parentRecordId,
          mapFrom((retweetedRecord) => retweetedRecord.commentedRecordId),
        ),
      );
    };
  }
}
