import { AutoMap } from '@automapper/classes';
import { Exclude } from 'class-transformer';

import { RecordPrivacySettings } from '../../record-privacy/entities/record-privacy-settings.entity';

import { RetweetedRecord } from './retweeted-record.entity';

export class Retweet {
  @AutoMap()
  authorId: string;

  @AutoMap()
  id: string;

  @AutoMap()
  retweetedRecordId: string;

  @AutoMap(() => RetweetedRecord)
  retweetedRecord: RetweetedRecord;

  @AutoMap(() => Date)
  createdAt: Date;

  @Exclude()
  @AutoMap(() => RecordPrivacySettings)
  privacySettings: RecordPrivacySettings;

  constructor(partialEntity: Partial<Retweet>) {
    Object.assign(this, partialEntity);
  }
}
