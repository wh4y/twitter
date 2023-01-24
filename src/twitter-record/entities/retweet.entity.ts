import { AutoMap } from '@automapper/classes';

import { TwitterRecordImage } from './twitter-record-image.entity';

export class Retweet {
  @AutoMap()
  authorId: string;

  @AutoMap()
  id: string;

  @AutoMap()
  text: string;

  @AutoMap(() => [TwitterRecordImage])
  images: TwitterRecordImage[];

  @AutoMap()
  retweetedRecordId: string;

  @AutoMap(() => Date)
  createdAt: Date;

  constructor(partialEntity: Partial<Retweet>) {
    Object.assign(this, partialEntity);
  }
}
