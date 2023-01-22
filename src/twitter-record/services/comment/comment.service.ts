import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';

import { TwitterRecord } from '../../entities/twitter-record.entity';
import { TwitterRecordRepository } from '../../repositories/twitter-record.repository';
import { Comment } from '../../entities/comment.entity';

import { CommentContentOptions } from './comment-service.options';

@Injectable()
export class CommentService {
  constructor(private readonly recordRepository: TwitterRecordRepository, @InjectMapper() private readonly mapper: Mapper) {}

  public async commentOnRecord(recordId: string, options: CommentContentOptions): Promise<Comment> {
    const commentedRecord = await this.recordRepository.findById(recordId);

    const comment = new TwitterRecord({ ...options, parentRecord: commentedRecord, isComment: true });

    await this.recordRepository.save(comment);

    return this.mapper.mapAsync(comment, TwitterRecord, Comment);
  }

  public async getRecordCommentsTrees(recordId: string): Promise<Comment[]> {
    const commentTrees = await this.recordRepository.findTreesOfRecordCommentsByRecordId(recordId);

    return this.mapper.mapArrayAsync(commentTrees, TwitterRecord, Comment);
  }
}
