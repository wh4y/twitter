import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

import { RedisRepository } from 'common/redis';

import { SignUpConfirmation } from '../entities/sign-up-confirmation.entity';

@Injectable()
export class SignUpConfirmationRepository {
  private readonly redisRepository: RedisRepository;

  constructor(@InjectRedis() private readonly redis: Redis) {
    this.redisRepository = new RedisRepository(redis);
  }

  public async deleteByEmail(email: string): Promise<void> {
    await this.redisRepository.del(email);
  }

  public async save(signUpConfirmation: SignUpConfirmation): Promise<void> {
    await this.redisRepository.set(signUpConfirmation.email, JSON.stringify(signUpConfirmation));
  }

  public async getByEmail(email: string): Promise<SignUpConfirmation> {
    const json = await this.redisRepository.get(email);

    return this.parseJsonEntity(json);
  }

  private parseJsonEntity(json: string): SignUpConfirmation {
    return JSON.parse(json);
  }
}
