import { Column, DeepPartial, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

import { User } from '../../users/entities/user.entity';

import { UserProfileAvatar } from './user-profile-avatar.entity';

@Entity()
export class UserProfile {
  @PrimaryColumn({
    type: 'uuid',
  })
  userId: string;

  username: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @OneToOne(() => UserProfileAvatar, (avatar) => avatar.profile)
  @JoinColumn()
  avatar: UserProfileAvatar;

  @Column({
    type: 'int',
    default: 0,
  })
  followingsCount: number;

  @Column({
    type: 'int',
    default: 0,
  })
  followersCount: number;

  constructor(partialEntity: DeepPartial<UserProfile>) {
    Object.assign(this, partialEntity);
  }
}
