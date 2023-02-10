import { Column, DeepPartial, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';

import { UserFollowing } from '../../user-followings/entities/user-following.entity';
import { User } from '../../users/entities/user.entity';

import { UserProfileAvatar } from './user-profile-avatar.entity';

@Entity()
export class UserProfile {
  @PrimaryColumn({
    type: 'uuid',
  })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @OneToOne(() => UserProfileAvatar, (avatar) => avatar.profile)
  avatar: UserProfileAvatar;

  followingsCount: number;

  @OneToMany(() => UserFollowing, (following) => following.follower)
  followings: UserFollowing[];

  followersCount: number;

  @OneToMany(() => UserFollowing, (following) => following.followedUser)
  followers: UserFollowing[];

  constructor(partialEntity: DeepPartial<UserProfile>) {
    Object.assign(this, partialEntity);
  }
}
