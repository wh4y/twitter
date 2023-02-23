import { Column, DeepPartial, Entity, JoinTable, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { ChatType } from '../enums/chat-type.enum';

import { ChatMember } from './chat-member.entity';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
  })
  type: ChatType;

  @OneToMany(() => ChatMember, (member) => member.chat, { cascade: ['insert'] })
  @JoinTable()
  members: ChatMember[];

  constructor(partialEntity: DeepPartial<Chat>) {
    Object.assign(this, partialEntity);
  }
}
