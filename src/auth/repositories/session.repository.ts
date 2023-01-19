import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

import { RedisRepository } from 'common/redis';

import { Session } from '../entities/session.entity';
import { SessionDoesntExistException } from '../exceptions/session-doesnt-exist.exception';

@Injectable()
export class SessionRepository {
  private readonly redisRepository: RedisRepository;

  constructor(@InjectRedis() private readonly redis: Redis) {
    this.redisRepository = new RedisRepository(redis);
  }

  public async save(session: Session): Promise<void> {
    await this.redisRepository.rpush(session.userId, JSON.stringify(session));
    await this.redisRepository.set(session.id, session.userId);
  }

  public async deleteOldestSessionByUserId(userId: string): Promise<Session> {
    const json = await this.redisRepository.lpop(userId);

    const session = this.parseJsonEntity(json);

    return session;
  }

  public async deleteSessionById(id: string): Promise<void> {
    const userId = await this.redisRepository.get(id);
    const jsonArray = await this.redisRepository.lrange(userId, 0, -1);

    const sessions = this.parseJsonEntityArray(jsonArray);

    const sessionsWithoutDeletedOne = sessions.filter((session) => session.id !== id);

    await this.redisRepository.del(userId);

    for (const session of sessionsWithoutDeletedOne) {
      await this.redisRepository.rpush(userId, JSON.stringify(session));
    }
  }

  public async getTotalUserSessionsCount(userId: string): Promise<number> {
    return this.redisRepository.llen(userId);
  }

  public async findById(id: string): Promise<Session> {
    const userId = await this.redisRepository.get(id);
    const jsonArray = await this.redisRepository.lrange(userId, 0, -1);
    const sessions = this.parseJsonEntityArray(jsonArray);

    const session = sessions.find((session) => session.id === id);

    if (!session) {
      throw new SessionDoesntExistException();
    }

    return session;
  }

  private parseJsonEntity(json: string): Session {
    const session = JSON.parse(json);

    Reflect.set(session, 'createdAt', new Date(session.createdAt));
    Reflect.set(session, 'expiredAt', new Date(session.expiredAt));

    return session;
  }

  private parseJsonEntityArray(jsonArray: string[]): Session[] {
    return jsonArray.map((json) => this.parseJsonEntity(json));
  }
}
