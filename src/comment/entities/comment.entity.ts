import { AutoMap } from '@automapper/classes';

import { TwitterRecordImage } from '../../twitter-record/entities/twitter-record-image.entity';

export class Comment {
  @AutoMap()
  authorId: string;

  @AutoMap()
  commentedRecordId: string;

  @AutoMap(() => [Comment])
  comments: Comment[];

  @AutoMap()
  id: string;

  @AutoMap()
  text: string;

  @AutoMap(() => [TwitterRecordImage])
  images: TwitterRecordImage[];
}
