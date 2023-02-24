import { Column, DeepPartial, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

import { UserProfile } from './user-profile.entity';

@Entity()
export class UserProfileAvatar {
  @PrimaryColumn({
    type: 'uuid',
  })
  userId: string;

  @OneToOne(() => UserProfile, (profile) => profile.avatar)
  @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
  profile: UserProfile;

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

  constructor(partialEntity: DeepPartial<UserProfileAvatar>) {
    Object.assign(this, partialEntity);
  }
}
