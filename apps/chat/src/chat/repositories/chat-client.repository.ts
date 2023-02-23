import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

import { RedisRepository } from 'common/redis';

import { ChatClient } from '../entities/chat-client.entity';

@Injectable()
export class ChatClientRepository {
  private readonly redisRepository: RedisRepository;

  constructor(@InjectRedis() private readonly redis: Redis) {
    this.redisRepository = new RedisRepository(redis, 'CHAT_ROOM');
  }

  public async add(client: ChatClient): Promise<void> {
    const existingClient = await this.findById(client.id);

    if (existingClient) {
      throw Error('Client already exits!');
    }

    await this.redisRepository.set(client.id, client.userId);
    await this.redisRepository.sadd(client.userId, client.id);
  }

  public async deleteById(id: string): Promise<void> {
    const client = await this.findById(id);

    if (!client) {
      return;
    }

    await this.redisRepository.del(id);
    await this.redisRepository.srem(client.userId, client.id);
  }

  public async findById(id: string): Promise<ChatClient> {
    const userId = await this.redisRepository.get(id);

    if (!userId) {
      return null;
    }

    return new ChatClient({ id, userId });
  }

  public async findManyByUserId(userId: string): Promise<ChatClient[]> {
    const clientIds = await this.redisRepository.smembers(userId);

    return clientIds.map((clientId) => {
      return new ChatClient({ id: clientId, userId });
    });
  }
}
