import { Column, DeepPartial, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryColumn } from 'typeorm';

import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class RecordPrivacySettings {
  @PrimaryColumn({
    type: 'uuid',
  })
  recordId: string;

  @OneToOne(() => TwitterRecord, { onDelete: 'CASCADE' })
  @JoinColumn()
  record: TwitterRecord;

  @Column({
    type: 'boolean',
    default: true,
  })
  isCommentingAllowed: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  isHidden: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  isVisibleForFollowersOnly: boolean;

  @ManyToMany(() => User, { onDelete: 'CASCADE' })
  @JoinTable()
  usersExceptedFromCommentingRules: User[];

  @ManyToMany(() => User, { onDelete: 'CASCADE' })
  @JoinTable()
  usersExceptedFromViewingRules: User[];

  constructor(partialEntity: DeepPartial<RecordPrivacySettings> = {}) {
    Object.assign(this, partialEntity);
  }
}
