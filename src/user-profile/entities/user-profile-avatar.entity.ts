import { Column, DeepPartial, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { UserProfile } from './user-profile.entity';

@Entity()
export class UserProfileAvatar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserProfile, (profile) => profile.avatar)
  @JoinColumn()
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
