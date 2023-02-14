import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserNotExistException } from '../../users/exceptions/user-not-exist.exception';
import { UsersRepository } from '../../users/repositories/users.repository';
import { RefreshToken } from '../entities/refresh-token.entity';
import { RefreshTokenNotExistException } from '../exceptions/refresh-token-not-exist.exception';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken) private readonly typeormRepository: Repository<RefreshToken>,
    private readonly usersRepository: UsersRepository,
  ) {}

  public async getTotalUserRefreshTokensCount(userId: string): Promise<number> {
    const doesUserExist = await this.usersRepository.checkIfUserExistsById(userId);

    if (!doesUserExist) {
      throw new UserNotExistException();
    }

    return this.typeormRepository.countBy({ userId });
  }

  public async deleteAllByUserId(userId: string): Promise<void> {
    const doesUserExist = await this.usersRepository.checkIfUserExistsById(userId);

    if (!doesUserExist) {
      throw new UserNotExistException();
    }

    await this.typeormRepository.delete({ userId });
  }

  public async deleteBySessionId(sessionId: string): Promise<void> {
    const doesRefreshTokenExist = await this.checkIfRefreshTokenExistsBySessionId(sessionId);

    if (!doesRefreshTokenExist) {
      throw new RefreshTokenNotExistException();
    }

    await this.typeormRepository.delete({ sessionId });
  }

  public async deleteOldestByUserId(userId: string): Promise<void> {
    const doesUserExist = await this.usersRepository.checkIfUserExistsById(userId);

    if (!doesUserExist) {
      throw new UserNotExistException();
    }

    const oldestEntity = await this.typeormRepository
      .createQueryBuilder('refreshToken')
      .where('refreshToken.userId = :userId', { userId })
      .orderBy('refreshToken.createdAt', 'ASC')
      .getOne();

    await this.typeormRepository.remove(oldestEntity);
  }

  public async deleteByValue(value: string): Promise<void> {
    const doesTokenExist = await this.checkIfRefreshTokenExistsByValue(value);

    if (!doesTokenExist) {
      throw new RefreshTokenNotExistException();
    }

    await this.typeormRepository.delete({ value });
  }

  public async findBySessionId(sessionId: string): Promise<RefreshToken> {
    const entity = await this.typeormRepository.findOneBy({ sessionId });

    if (!entity) {
      throw new RefreshTokenNotExistException();
    }

    return entity;
  }

  public async save(refreshToken: RefreshToken): Promise<void> {
    await this.typeormRepository.save(refreshToken);
  }

  public async checkIfRefreshTokenExistsBySessionId(sessionId: string): Promise<boolean> {
    return this.typeormRepository.createQueryBuilder().where({ sessionId }).getExists();
  }

  public async checkIfRefreshTokenExistsByValue(value: string): Promise<boolean> {
    return this.typeormRepository.createQueryBuilder().where({ value }).getExists();
  }
}
