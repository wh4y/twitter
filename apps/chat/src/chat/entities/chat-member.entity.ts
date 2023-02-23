import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { User } from '../../user/entities/user.entity';
import { ChatMemberRole } from '../enums/chat-member-role.enum';

import { Chat } from './chat.entity';

@Entity()
export class ChatMember {
  @PrimaryColumn({
    type: 'uuid',
  })
  chatId: string;

  @ManyToOne(() => Chat, (chat) => chat.members, { onDelete: 'CASCADE' })
  @JoinColumn()
  chat: Chat;

  @PrimaryColumn({
    type: 'uuid',
  })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({
    type: 'varchar',
    default: ChatMemberRole.ORDINARY_MEMBER,
  })
  role: ChatMemberRole;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  constructor(partialEntity: Partial<ChatMember>) {
    Object.assign(this, partialEntity);
  }
}
