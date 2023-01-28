import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity()
export class UserFollowing {
  @PrimaryColumn({
    type: 'uuid',
  })
  followerId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn()
  follower: User;

  @PrimaryColumn({
    type: 'uuid',
  })
  followedUserId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn()
  followedUser: User;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  constructor(partialEntity: Partial<UserFollowing>) {
    Object.assign(this, partialEntity);
  }
}
