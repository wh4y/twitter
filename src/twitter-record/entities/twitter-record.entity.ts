import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeepPartial,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';

import { RecordLike } from '../../record-likes/entities/record-like.entity';
import { RecordPrivacySettings } from '../../record-privacy/entities/record-privacy-settings.entity';
import { User } from '../../users/entities/user.entity';

import { TwitterRecordImage } from './twitter-record-image.entity';

@Entity()
@Tree('materialized-path')
export class TwitterRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
  isQuote: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  isDeleted: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: false,
  })
  createdAt: Date;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  parentRecordId: string;

  @TreeParent({ onDelete: 'SET NULL' })
  parentRecord: TwitterRecord;

  @TreeChildren()
  childRecords: TwitterRecord[];

  @Column({
    type: 'varchar',
    nullable: true,
  })
  text: string;

  @OneToMany(() => TwitterRecordImage, (image) => image.record, { cascade: true })
  images: TwitterRecordImage[];

  @Column({
    type: 'int',
    default: 0,
  })
  likesCount: number;

  @OneToMany(() => RecordLike, (like) => like.record, { cascade: ['insert'] })
  likes: RecordLike[];

  @Exclude()
  @OneToOne(() => RecordPrivacySettings, (settings) => settings.record, { cascade: true })
  privacySettings: RecordPrivacySettings;

  constructor(partialEntity: DeepPartial<TwitterRecord> = {}) {
    Object.assign(this, partialEntity);
  }
}
