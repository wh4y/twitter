import { AutoMap } from '@automapper/classes';

import { TwitterRecordImage } from './twitter-record-image.entity';

export class Tweet {
  @AutoMap()
  authorId: string;

  @AutoMap()
  id: string;

  @AutoMap()
  text: string;

  @AutoMap(() => [TwitterRecordImage])
  images: TwitterRecordImage[];
}
