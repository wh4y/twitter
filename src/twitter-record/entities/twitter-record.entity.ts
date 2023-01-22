import { AutoMap } from '@automapper/classes';
import {
  Column,
  CreateDateColumn,
  DeepPartial,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

import { TwitterRecordImage } from './twitter-record-image.entity';

@Entity()
@Tree('materialized-path')
export class TwitterRecord {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @AutoMap()
  @Column({
    type: 'uuid',
    nullable: false,
  })
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn()
  author: User;

  @Column({
    type: 'boolean',
    default: false,
  })
  isComment: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  isRetweet: boolean;

  @AutoMap(() => Date)
  @CreateDateColumn({
    type: 'timestamp',
    nullable: false,
  })
  createdAt: Date;

  @AutoMap()
  @Column({
    type: 'uuid',
    nullable: true,
  })
  parentRecordId: string;

  @TreeParent()
  parentRecord: TwitterRecord;

  @AutoMap(() => [TwitterRecord])
  @TreeChildren()
  childRecords: TwitterRecord[];

  @AutoMap()
  @Column({
    type: 'varchar',
    nullable: true,
  })
  text: string;

  @AutoMap(() => [TwitterRecordImage])
  @OneToMany(() => TwitterRecordImage, (image) => image.record, { cascade: true })
  images: TwitterRecordImage[];

  constructor(partialEntity: DeepPartial<TwitterRecord> = {}) {
    Object.assign(this, partialEntity);
  }
}
