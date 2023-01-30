import { Injectable } from '@nestjs/common';

import { RecordLike } from '../entities/record-like.entity';
import { RecordLikeRepository } from '../repositories/record-like.repository';

import { LikeRecordOptions } from './record-likes-service.options';

@Injectable()
export class RecordLikesService {
  constructor(private readonly recordLikeRepository: RecordLikeRepository) {}

  public async likeRecord(options: LikeRecordOptions): Promise<RecordLike> {
    const like = new RecordLike({ ...options });

    await this.recordLikeRepository.saveIfNotExist(like);

    return like;
  }

  public async removeLikeFormRecord({ recordId, userId }: LikeRecordOptions): Promise<void> {
    await this.recordLikeRepository.deleteByRecordAndUserIdsOrThrow(recordId, userId);
  }
}
