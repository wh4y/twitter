import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

import { RedisRepository } from 'common/redis';

import { SignUpConfirmation } from '../entities/sign-up-confirmation.entity';
import { SignUpConfirmationAlreadyExistsException } from '../exceptions/sign-up-confirmation-already-exists.exception';
import { SignUpConfirmationNotExistException } from '../exceptions/sign-up-confirmation-not-exist.exception';

@Injectable()
export class SignUpConfirmationRepository {
  private readonly redisRepository: RedisRepository;

  constructor(@InjectRedis() private readonly redis: Redis) {
    this.redisRepository = new RedisRepository(redis, 'SIGN_UP_CONFIRMATION');
  }

  public async deleteByEmail(email: string): Promise<void> {
    const confirmation = await this.getByEmail(email);

    if (!confirmation) {
      throw new SignUpConfirmationNotExistException();
    }

    await this.redisRepository.del(email);
  }

  public async saveIfNotExist(signUpConfirmation: SignUpConfirmation): Promise<void> {
    const doesConfirmationExist = await this.checkIfConfirmationExistsByEmail(signUpConfirmation.email);

    if (doesConfirmationExist) {
      throw new SignUpConfirmationAlreadyExistsException();
    }

    await this.redisRepository.set(signUpConfirmation.email, JSON.stringify(signUpConfirmation));
  }

  public async getByEmail(email: string): Promise<SignUpConfirmation> {
    const json = await this.redisRepository.get(email);

    if (!json) {
      throw new SignUpConfirmationNotExistException();
    }

    return this.parseJsonEntity(json);
  }

  private parseJsonEntity(json: string): SignUpConfirmation {
    return JSON.parse(json);
  }

  private async checkIfConfirmationExistsByEmail(email: string): Promise<boolean> {
    return Boolean(await this.redisRepository.get(email));
  }
}
