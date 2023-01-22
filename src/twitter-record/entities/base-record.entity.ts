import { AutoMap } from '@automapper/classes';

import { BaseRecordImage } from './base-record-image.entity';

export class BaseRecord {
  @AutoMap()
  public readonly authorId: string;

  @AutoMap(() => Date)
  public readonly createdAt: Date;

  @AutoMap()
  public text: string;

  @AutoMap()
  public readonly id: string;

  @AutoMap(() => [BaseRecordImage])
  public images: BaseRecordImage[];
}
