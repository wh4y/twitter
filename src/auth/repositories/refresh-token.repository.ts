import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository {
  constructor(@InjectRepository(RefreshToken) private readonly typeormRepository: Repository<RefreshToken>) {}

  public async getTotalUserRefreshTokensCount(userId: string): Promise<number> {
    return this.typeormRepository.countBy({ userId });
  }

  public async deleteAllByUserId(userId: string): Promise<void> {
    await this.typeormRepository.delete({ userId });
  }

  public async deleteBySessionId(sessionId: string): Promise<void> {
    const doesRefreshTokenExist = await this.checkIfRefreshTokenExistsBySessionId(sessionId);

    if (!doesRefreshTokenExist) {
      throw new Error();
    }

    await this.typeormRepository.delete({ sessionId });
  }

  public async deleteOldestByUserId(userId: string): Promise<void> {
    const oldestEntity = await this.typeormRepository
      .createQueryBuilder('refreshToken')
      .where('refreshToken.userId = :userId', { userId })
      .orderBy('refreshToken.createdAt', 'ASC')
      .getOne();

    await this.typeormRepository.remove(oldestEntity);
  }

  public async findBySessionId(sessionId: string): Promise<RefreshToken> {
    const entity = await this.typeormRepository.findOneBy({ sessionId });

    if (!entity) {
      throw new Error();
    }

    return entity;
  }

  public async save(refreshToken: RefreshToken): Promise<void> {
    await this.typeormRepository.save(refreshToken);
  }

  public async checkIfRefreshTokenExistsBySessionId(sessionId: string): Promise<boolean> {
    return this.typeormRepository.createQueryBuilder().where({ sessionId }).getExists();
  }
}
