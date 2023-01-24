import { Injectable } from '@nestjs/common';

import { Comment } from '../../entities/comment.entity';
import { TwitterRecordRepository } from '../../repositories/twitter-record.repository';

import { CommentContentOptions } from './comment-service.options';

@Injectable()
export class CommentService {
  constructor(private readonly recordRepository: TwitterRecordRepository) {}

  public async commentOnRecord(recordId: string, options: CommentContentOptions): Promise<Comment> {
    const comment = new Comment({ ...options, commentedRecordId: recordId });

    await this.recordRepository.saveComment(comment);

    return comment;
  }

  public async getRecordCommentsTrees(recordId: string): Promise<Comment[]> {
    return this.recordRepository.findTreesOfRecordCommentsByRecordId(recordId);
  }
}
