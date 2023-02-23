import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

import { RedisRepository } from 'common/redis';

import { Session } from '../entities/session.entity';
import { SessionNotExistException } from '../exceptions/session-not-exist.exception';

@Injectable()
export class SessionRepository {
  private readonly redisRepository: RedisRepository;

  constructor(@InjectRedis() private readonly redis: Redis) {
    this.redisRepository = new RedisRepository(redis, 'SESSION');
  }

  public async findByIdOrThrow(id: string): Promise<Session> {
    const jsonEntity = await this.redisRepository.get(id);

    if (!jsonEntity) {
      throw new SessionNotExistException();
    }

    return this.parseJsonEntity(jsonEntity);
  }

  private parseJsonEntity(json: string): Session {
    const session = JSON.parse(json);

    Reflect.set(session, 'createdAt', new Date(session.createdAt));
    Reflect.set(session, 'expiredAt', new Date(session.expiredAt));

    return session;
  }
}
