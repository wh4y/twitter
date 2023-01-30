import { AutoMap } from '@automapper/classes';
import { Exclude } from 'class-transformer';

import { RecordLike } from '../../record-likes/entities/record-like.entity';
import { RecordPrivacySettings } from '../../record-privacy/entities/record-privacy-settings.entity';
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

  @AutoMap()
  isDeleted: boolean;

  @AutoMap(() => Date)
  createdAt: Date;

  @AutoMap(() => RecordLike)
  likes: RecordLike[];

  @Exclude()
  @AutoMap(() => RecordPrivacySettings)
  privacySettings: RecordPrivacySettings;

  constructor(partialEntity: Partial<Comment>) {
    Object.assign(this, partialEntity);
  }
}
