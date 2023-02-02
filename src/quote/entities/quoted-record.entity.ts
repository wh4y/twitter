import { AutoMap } from '@automapper/classes';
import { Exclude } from 'class-transformer';

import { RecordPrivacySettings } from '../../record-privacy/entities/record-privacy-settings.entity';
import { TwitterRecordImage } from '../../twitter-record/entities/twitter-record-image.entity';

export class QuotedRecord {
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

  @AutoMap()
  quotedRecordId?: string;

  @AutoMap(() => Date)
  createdAt: Date;

  @Exclude()
  @AutoMap(() => RecordPrivacySettings)
  privacySettings: RecordPrivacySettings;
}
