import { Column, DeepPartial, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { BaseRecordImage } from './base-record-image.entity';
import { TwitterRecord } from './twitter-record.entity';

@Entity()
export class TwitterRecordImage extends BaseRecordImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  path: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  name: string;

  @ManyToOne(() => TwitterRecord, (record) => record.images)
  record: TwitterRecord;

  constructor(partialEntity: DeepPartial<TwitterRecordImage>) {
    super();
    Object.assign(this, partialEntity);
  }
}
