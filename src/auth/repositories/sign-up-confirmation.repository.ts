import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { RedisRepository } from 'common/redis';
import Redis from 'ioredis';

import { SignUpConfirmation } from '../entities/sign-up-confirmation.entity';

@Injectable()
export class SignUpConfirmationRepository {
  private readonly redisRepository: RedisRepository<SignUpConfirmation>;

  constructor(@InjectRedis() private readonly redis: Redis) {
    this.redisRepository = new RedisRepository(redis, 'SIGN_UP_CONFIRMATION');
  }

  public async deleteByEmail(email: string): Promise<void> {
    await this.redisRepository.del(email);
  }

  public async save(signUpConfirmation: SignUpConfirmation): Promise<void> {
    await this.redisRepository.set(signUpConfirmation.email, signUpConfirmation);
  }

  public async getByEmail(email: string): Promise<SignUpConfirmation> {
    return this.redisRepository.get(email);
  }
}
