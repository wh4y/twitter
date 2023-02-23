import { Column, DeepPartial, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn, JoinColumn, CreateDateColumn } from 'typeorm';

import { User } from '../../user/entities/user.entity';

import { Chat } from './chat.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
  })
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn()
  author: User;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  text: string;

  @Column({
    type: 'uuid',
  })
  chatId: string;

  @ManyToMany(() => Chat)
  @JoinColumn()
  chat: Chat;

  constructor(partialEntity: DeepPartial<Message>) {
    Object.assign(this, partialEntity);
  }
}
