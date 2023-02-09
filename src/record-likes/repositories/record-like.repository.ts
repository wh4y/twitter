import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Paginated, PaginationOptions } from 'common/pagination';

import { TwitterRecordRepository } from '../../twitter-record/repositories/twitter-record.repository';
import { UsersRepository } from '../../users/repositories/users.repository';
import { RecordLike } from '../entities/record-like.entity';
import { LikeAlreadyExistsExceptions } from '../exceptions/like-already-exists.exceptions';
import { LikeNotExitExceptions } from '../exceptions/like-not-exit.exceptions';

@Injectable()
export class RecordLikeRepository {
  constructor(
    @InjectRepository(RecordLike) private readonly typeormRepository: Repository<RecordLike>,
    private readonly recordRepository: TwitterRecordRepository,
    private readonly userRepository: UsersRepository,
  ) {}

  public async add(like: RecordLike): Promise<void> {
    const doesRecordLikeAlreadyExist = await this.checkIfLikeExistsByRecordAndUserIds(like.recordId, like.userId);

    if (doesRecordLikeAlreadyExist) {
      throw new LikeAlreadyExistsExceptions();
    }

    await this.recordRepository.findRecordByIdOrThrow(like.recordId);
    await this.userRepository.findUserByIdOrThrow(like.userId);

    await this.typeormRepository.save(like);

    await this.recordRepository.incrementRecordLikesCountByRecordId(like.recordId);
  }

  public async deleteByRecordAndUserIdsOrThrow(recordId: string, userId: string): Promise<void> {
    const doesLikeExist = await this.checkIfLikeExistsByRecordAndUserIds(recordId, userId);

    if (!doesLikeExist) {
      throw new LikeNotExitExceptions();
    }

    await this.typeormRepository.delete({ recordId, userId });
  }

  public async checkIfLikeExistsByRecordAndUserIds(recordId: string, userId: string): Promise<boolean> {
    return this.typeormRepository.exist({ where: { recordId, userId } });
  }

  public async findLikesByUserId(userId: string, paginationOptions: PaginationOptions): Promise<Paginated<RecordLike>> {
    const take = paginationOptions.take || 0;
    const skip = (paginationOptions.page - 1) * take;

    const [likes, total] = await this.typeormRepository.findAndCount({
      where: { userId },
      skip,
      take,
    });

    return { data: likes, page: paginationOptions.page, total, take: take || total };
  }
}
