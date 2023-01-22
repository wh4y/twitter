import { createMap, forMember, mapFrom, Mapper, mapWith } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';

import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { Comment } from '../entities/comment.entity';

export class CommentMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  public override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        TwitterRecord,
        Comment,
        forMember(
          (comment) => comment.commentedRecordId,
          mapFrom((record) => record.parentRecordId),
        ),
        forMember(
          (comment) => comment.comments,
          mapWith(Comment, TwitterRecord, (record) => record.childRecords),
        ),
      );
    };
  }
}
