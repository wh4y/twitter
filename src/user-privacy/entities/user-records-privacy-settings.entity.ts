import { Column, DeepPartial, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryColumn } from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity()
export class UserRecordsPrivacySettings {
  @PrimaryColumn({
    type: 'varchar',
  })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({
    type: 'boolean',
    default: true,
  })
  isCommentingAllowed: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  areHidden: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  areVisibleForFollowersOnly: boolean;

  @ManyToMany(() => User, { onDelete: 'CASCADE' })
  @JoinTable()
  usersExceptedFromCommentingRules: User[];

  @ManyToMany(() => User, { onDelete: 'CASCADE' })
  @JoinTable()
  usersExceptedFromViewingRules: User[];

  constructor(partialEntity: DeepPartial<UserRecordsPrivacySettings>) {
    Object.assign(this, partialEntity);
  }
}
