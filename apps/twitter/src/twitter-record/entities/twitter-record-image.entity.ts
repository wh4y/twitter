import { Column, DeepPartial, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TwitterRecord } from './twitter-record.entity';

@Entity()
export class TwitterRecordImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  path: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  name: string;

  @ManyToOne(() => TwitterRecord, (record) => record.images, { onDelete: 'CASCADE' })
  record: TwitterRecord;

  constructor(partialEntity: DeepPartial<TwitterRecordImage>) {
    Object.assign(this, partialEntity);
  }
}
