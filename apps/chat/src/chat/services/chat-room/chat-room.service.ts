import { Injectable } from '@nestjs/common';

import { ChatClient } from '../../entities/chat-client.entity';
import { ChatRoom } from '../../entities/chat-room.entity';
import { ChatRoomRepository } from '../../repositories/chat-room/chat-room.repository';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class ChatRoomService {
  constructor(private readonly chatService: ChatService, private readonly chatRoomRepository: ChatRoomRepository) {}

  public async joinAllClientChatRooms(client: ChatClient): Promise<void> {
    const { data: chats } = await this.chatService.getUserChats(client.userId, { page: 1, take: Infinity });
    const chatIds = chats.map((chat) => chat.id);

    for (const chatId of chatIds) {
      const room = await this.chatRoomRepository.findByChatId(chatId);

      if (!room) {
        const newRoom = new ChatRoom({ chatId, clientIds: [client.id] });

        await this.chatRoomRepository.add(newRoom);

        continue;
      }

      room.clientIds.push(client.id);
      await this.chatRoomRepository.update(room);
    }
  }

  public async joinChatRoom(chatId: string, client: ChatClient): Promise<void> {
    const room = await this.chatRoomRepository.findByChatId(chatId);

    room.clientIds.push(client.id);

    await this.chatRoomRepository.update(room);
  }

  public async leaveRoom(client: ChatClient, chatId: string): Promise<void> {
    await this.chatRoomRepository.removeClientFromRoomByClientAndChatIds(client.id, chatId);
  }

  public async leaveAllClientChatRooms(client: ChatClient): Promise<void> {
    const { data: chats } = await this.chatService.getUserChats(client.userId, { page: 1, take: Infinity });
    const chatIds = chats.map((chat) => chat.id);

    for (const chatId of chatIds) {
      await this.leaveRoom(client, chatId);
    }
  }

  public async getRoomByChatId(chatId: string): Promise<ChatRoom> {
    return this.chatRoomRepository.findByChatId(chatId);
  }
}
