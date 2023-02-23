import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { User } from '../../user/entities/user.entity';

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

  constructor(partialEntity: Partial<ChatMember>) {
    Object.assign(this, partialEntity);
  }

  public static from(user: User): ChatMember {
    return new ChatMember({ userId: user.id });
  }
}
