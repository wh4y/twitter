import { createMap, forMember, mapFrom, Mapper, mapWith } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';

import { Comment } from '../entities/comment.entity';
import { TwitterRecord } from '../entities/twitter-record.entity';

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
      createMap(
        mapper,
        Comment,
        TwitterRecord,
        forMember(
          (record) => record.parentRecordId,
          mapFrom((comment) => comment.commentedRecordId),
        ),
        forMember(
          (record) => record.childRecords,
          mapWith(TwitterRecord, Comment, (comment) => comment.comments),
        ),
      );
    };
  }
}
