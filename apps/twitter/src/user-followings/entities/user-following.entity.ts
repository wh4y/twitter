import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { UserProfile } from '../../user-profile/entities/user-profile.entity';

@Entity()
export class UserFollowing {
  @PrimaryColumn({
    type: 'uuid',
  })
  followerId: string;

  @ManyToOne(() => UserProfile, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'followerId', referencedColumnName: 'userId' })
  follower: UserProfile;

  @PrimaryColumn({
    type: 'uuid',
  })
  followedUserId: string;

  @ManyToOne(() => UserProfile, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'followedUserId', referencedColumnName: 'userId' })
  followedUser: UserProfile;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  constructor(partialEntity: Partial<UserFollowing>) {
    Object.assign(this, partialEntity);
  }
}
