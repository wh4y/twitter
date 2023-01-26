import { ForbiddenError } from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { RecordPermissionsService } from '../../record-permissions/services/record-permissions.service';
import { TwitterRecordRepository } from '../../twitter-record/repositories/twitter-record.repository';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../entities/comment.entity';

import { CommentContentOptions } from './comment-service.options';

@Injectable()
export class CommentService {
  constructor(
    private readonly recordRepository: TwitterRecordRepository,
    private readonly recordPermissionsService: RecordPermissionsService,
  ) {}

  public async commentOnRecord(recordId: string, options: CommentContentOptions, currentUser: User): Promise<Comment> {
    const record = await this.recordRepository.findRecordByIdOrThrow(recordId);

    await this.recordPermissionsService.currentUserCanCommentOnUserRecordsOrThrow(currentUser, { id: record.authorId } as User);

    const abilityToCommentOnRecords = await this.recordPermissionsService.defineAbilityToCommentOnRecordsFor(currentUser);

    ForbiddenError.from(abilityToCommentOnRecords).throwUnlessCan('comment', record);

    const comment = new Comment({ ...options, authorId: currentUser.id, commentedRecordId: recordId });

    await this.recordRepository.saveComment(comment);

    return comment;
  }

  public async deleteComment(commentId: string, currentUser: User): Promise<Comment> {
    const comment = await this.recordRepository.findCommentByIdOrThrow(commentId);

    const abilityToManageRecords = await this.recordPermissionsService.defineAbilityToManageRecordsFor(currentUser);

    ForbiddenError.from(abilityToManageRecords).throwUnlessCan('delete', comment);

    await this.recordRepository.deleteByIdOrThrow(commentId);

    return comment;
  }

  public async editCommentContent(commentId, options: CommentContentOptions, currentUser: User): Promise<Comment> {
    const comment = await this.recordRepository.findCommentByIdOrThrow(commentId);

    const abilityToManageRecords = await this.recordPermissionsService.defineAbilityToManageRecordsFor(currentUser);

    ForbiddenError.from(abilityToManageRecords).throwUnlessCan('edit', comment);

    Object.assign(comment, options);

    await this.recordRepository.saveComment(comment);

    return comment;
  }

  public async getRecordCommentsTrees(recordId: string): Promise<Comment[]> {
    return this.recordRepository.findTreesOfRecordCommentsByRecordId(recordId);
  }
}