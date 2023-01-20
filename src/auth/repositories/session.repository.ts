import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

import { RedisRepository } from 'common/redis';

import { SESSION_TTL_IN_MILLISECONDS } from '../constants/session-ttl.constant';
import { Session } from '../entities/session.entity';
import { SessionNotExistException } from '../exceptions/session-not-exist.exception';

@Injectable()
export class SessionRepository {
  private readonly redisRepository: RedisRepository;

  constructor(@InjectRedis() private readonly redis: Redis) {
    this.redisRepository = new RedisRepository(redis);
  }

  public async save(session: Session): Promise<void> {
    await this.redisRepository.rpush(session.userId, session.id);
    await this.redisRepository.set(session.id, JSON.stringify(session), SESSION_TTL_IN_MILLISECONDS);
  }

  public async deleteOldestSessionByUserId(userId: string): Promise<Session> {
    const sessionId = await this.redisRepository.lpop(userId);

    const session = await this.findByIdOrThrow(sessionId);

    await this.deleteById(sessionId);

    return session;
  }

  public async deleteById(id: string): Promise<void> {
    const { userId } = await this.findByIdOrThrow(id);

    const sessionIds = await this.redisRepository.lrange(userId, 0, -1);

    const sessionIdsWithoutDeletedOne = sessionIds.filter((sessionId) => sessionId !== id);

    await this.redisRepository.del(id);

    await this.updateUserSessionIds(userId, sessionIdsWithoutDeletedOne);
  }

  public async deleteByUserId(userId: string): Promise<void> {
    const sessionIds = await this.redisRepository.lrange(userId, 0, -1);

    for (const sessionId of sessionIds) {
      await this.deleteById(sessionId);
    }

    await this.redisRepository.del(userId);
  }

  public async getTotalUserSessionsCount(userId: string): Promise<number> {
    return this.redisRepository.llen(userId);
  }

  public async findByIdOrThrow(id: string): Promise<Session> {
    const jsonEntity = await this.redisRepository.get(id);

    if (!jsonEntity) {
      throw new SessionNotExistException();
    }

    return this.parseJsonEntity(jsonEntity);
  }

  public async findManyByUserId(userId: string): Promise<Session[]> {
    const sessionIds = await this.redisRepository.lrange(userId, 0, -1);

    const sessionJsonEntities: string[] = [];

    for (const sessionId of sessionIds) {
      const sessionJson = await this.redisRepository.get(sessionId);

      if (!sessionJson) {
        const filteredIds = sessionIds.filter((id) => id !== sessionId);

        await this.updateUserSessionIds(userId, filteredIds);

        continue;
      }

      sessionJsonEntities.push(sessionJson);
    }

    return this.parseJsonEntityArray(sessionJsonEntities);
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

  private async updateUserSessionIds(userId: string, sessionIds: string[]): Promise<void> {
    await this.redisRepository.del(userId);

    for (const sessionId of sessionIds) {
      await this.redisRepository.rpush(userId, sessionId);
    }
  }
}
