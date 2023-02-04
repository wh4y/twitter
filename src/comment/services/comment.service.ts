import { ForbiddenError } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { asyncFilter } from 'common/array-utils';

import { RecordPermissionsService } from '../../record-permissions/services/record-permissions.service';
import { RecordPrivacySettings } from '../../record-privacy/entities/record-privacy-settings.entity';
import { RecordImageRepository } from '../../twitter-record/repositories/record-image.repository';
import { TwitterRecordRepository } from '../../twitter-record/repositories/twitter-record.repository';
import { EditRecordContentOptions } from '../../twitter-record/types/edit-record-content-options.type';
import { RecordContent } from '../../twitter-record/types/record-content.type';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    private readonly recordRepository: TwitterRecordRepository,
    private readonly recordImageRepository: RecordImageRepository,
    private readonly recordPermissionsService: RecordPermissionsService,
  ) {}

  public async commentOnRecord(recordId: string, options: RecordContent, currentUser: User): Promise<Comment> {
    const record = await this.recordRepository.findRecordByIdOrThrow(recordId);

    const abilityToCommentOnRecords = await this.recordPermissionsService.defineCurrentUserAbilityToCommentOnUserRecordsOrThrow({
      currentUser,
      target: { id: record.authorId } as User,
    });

    ForbiddenError.from(abilityToCommentOnRecords).throwUnlessCan('comment', record);

    const recordPrivacySettings = new RecordPrivacySettings();

    const comment = new Comment({
      ...options,
      authorId: currentUser.id,
      commentedRecordId: recordId,
      privacySettings: recordPrivacySettings,
    });

    await this.recordRepository.saveComment(comment);

    return comment;
  }

  public async deleteComment(commentId: string, currentUser: User): Promise<Comment> {
    const comment = await this.recordRepository.findCommentByIdOrThrow(commentId);

    const abilityToManageRecords = await this.recordPermissionsService.defineAbilityToManageRecordsFor(currentUser);

    ForbiddenError.from(abilityToManageRecords).throwUnlessCan('delete', comment);

    await this.recordRepository.deleteCommentById(commentId);

    return comment;
  }

  public async editCommentContent(
    commentId,
    { idsOfImagesToBeSaved, newImages, text }: EditRecordContentOptions,
    currentUser: User,
  ): Promise<Comment> {
    const comment = await this.recordRepository.findCommentByIdOrThrow(commentId);

    const abilityToManageRecords = await this.recordPermissionsService.defineAbilityToManageRecordsFor(currentUser);

    ForbiddenError.from(abilityToManageRecords).throwUnlessCan('edit', comment);

    const existingImagesToBeSaved = await this.recordImageRepository.findImagesByIds(idsOfImagesToBeSaved);
    const updatedRecordImages = [...existingImagesToBeSaved, ...newImages];

    comment.images = updatedRecordImages;
    comment.text = text;

    await this.recordRepository.saveComment(comment);

    return comment;
  }

  public async getRecordCommentsTrees(recordId: string): Promise<Comment[]> {
    return this.recordRepository.findTreesOfRecordCommentsByRecordId(recordId);
  }

  /**
   * @Deprecated Not recommended to use for performance reasons.
   * @Todo Optimize records filtration available for current user.
   */
  public async getCommentsByAuthorIds(ids: string[], currentUser: User): Promise<Comment[]> {
    const comments = await this.recordRepository.findCommentsByAuthorIds(ids);

    const commentsAllowedToView = await asyncFilter(comments, async (comment) => {
      return this.recordPermissionsService.canCurrentUserViewRecord(currentUser, comment);
    });

    return commentsAllowedToView;
  }

  public async getUserComments(userId: string, currentUser: User): Promise<Comment[]> {
    const abilityToCommentOnRecords = await this.recordPermissionsService.defineCurrentUserAbilityToCommentOnUserRecordsOrThrow({
      currentUser,
      target: { id: userId } as User,
    });

    const comments = await this.recordRepository.findCommentsByAuthorIds([userId]);

    const commentsAllowedToView = comments.filter((comment) => abilityToCommentOnRecords.can('view', comment));

    return commentsAllowedToView;
  }
}
