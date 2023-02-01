import { AutoMap } from '@automapper/classes';
import { Exclude } from 'class-transformer';

import { RecordLike } from '../../record-likes/entities/record-like.entity';
import { RecordPrivacySettings } from '../../record-privacy/entities/record-privacy-settings.entity';
import { TwitterRecordImage } from '../../twitter-record/entities/twitter-record-image.entity';

export class RetweetedRecord {
  @AutoMap()
  authorId: string;

  @AutoMap()
  id: string;

  @AutoMap()
  text: string;

  @AutoMap(() => [TwitterRecordImage])
  images: TwitterRecordImage[];

  @AutoMap()
  isDeleted?: boolean;

  @AutoMap()
  commentedRecordId?: string;

  @AutoMap(() => Date)
  createdAt: Date;

  @AutoMap(() => RecordLike)
  likes: RecordLike[];

  @Exclude()
  @AutoMap(() => RecordPrivacySettings)
  privacySettings: RecordPrivacySettings;
}
