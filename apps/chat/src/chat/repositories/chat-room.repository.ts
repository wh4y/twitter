import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

import { RedisRepository } from 'common/redis';

import { ChatRoom } from '../entities/chat-room.entity';

@Injectable()
export class ChatRoomRepository {
  private readonly redisRepository: RedisRepository;

  constructor(@InjectRedis() private readonly redis: Redis) {
    this.redisRepository = new RedisRepository(redis, 'CHAT_ROOM');
  }

  public async add({ chatId, clientIds }: ChatRoom): Promise<void> {
    const existingRoom = await this.findByChatId(chatId);

    if (existingRoom) {
      throw new Error('Chat room already exists!');
    }

    for (const clientId of clientIds) {
      await this.redisRepository.sadd(chatId, clientId);
    }
  }

  public async findByChatId(chatId: string): Promise<ChatRoom> {
    const clientIds = await this.redisRepository.smembers(chatId);

    return new ChatRoom({ chatId, clientIds });
  }

  public async update(room: ChatRoom): Promise<void> {
    const existingRoom = await this.findByChatId(room.chatId);

    if (!existingRoom) {
      throw new Error("Chat room doesn't exists!");
    }

    const clientIdsToBeDeleted = existingRoom.clientIds.filter((candidate) => {
      return room.clientIds.every((clientId) => candidate !== clientId);
    });

    for (const clientIdToBeDeleted of clientIdsToBeDeleted) {
      await this.redisRepository.srem(room.chatId, clientIdToBeDeleted);
    }

    for (const clientId of room.clientIds) {
      await this.redisRepository.sadd(room.chatId, clientId);
    }
  }

  public async deleteByChatId(chatId: string): Promise<void> {
    await this.redisRepository.del(chatId);
  }
}
