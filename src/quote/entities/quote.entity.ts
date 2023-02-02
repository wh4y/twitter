import { AutoMap } from '@automapper/classes';
import { Exclude } from 'class-transformer';

import { RecordLike } from '../../record-likes/entities/record-like.entity';
import { RecordPrivacySettings } from '../../record-privacy/entities/record-privacy-settings.entity';
import { TwitterRecordImage } from '../../twitter-record/entities/twitter-record-image.entity';

import { QuotedRecord } from './quoted-record.entity';

export class Quote {
  @AutoMap()
  authorId: string;

  @AutoMap()
  id: string;

  @AutoMap()
  text: string;

  @AutoMap(() => [TwitterRecordImage])
  images: TwitterRecordImage[];

  @AutoMap(() => Date)
  createdAt: Date;

  @AutoMap()
  quotedRecordId: string;

  @AutoMap(() => QuotedRecord)
  quotedRecord: QuotedRecord;

  @AutoMap(() => RecordLike)
  likes: RecordLike[];

  @Exclude()
  @AutoMap(() => RecordPrivacySettings)
  privacySettings: RecordPrivacySettings;

  constructor(partialEntity: Partial<Quote>) {
    Object.assign(this, partialEntity);
  }
}
