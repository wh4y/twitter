import { ForbiddenError } from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { asyncFilter } from 'common/array-utils';
import { Paginated, PaginationOptions } from 'common/pagination';

import { RecordPermissionsService } from '../../record-permissions/services/record-permissions.service';
import { RecordPrivacySettings } from '../../record-privacy/entities/record-privacy-settings.entity';
import { TwitterRecord } from '../../twitter-record/entities/twitter-record.entity';
import { RecordImageRepository } from '../../twitter-record/repositories/record-image.repository';
import { TwitterRecordRepository } from '../../twitter-record/repositories/twitter-record.repository';
import { EditRecordContentOptions } from '../../twitter-record/types/edit-record-content-options.type';
import { RecordContent } from '../../twitter-record/types/record-content.type';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class CommentService {
  constructor(
    private readonly recordRepository: TwitterRecordRepository,
    private readonly recordImageRepository: RecordImageRepository,
    private readonly recordPermissionsService: RecordPermissionsService,
  ) {}

  public async commentOnRecord(recordId: string, options: RecordContent, currentUser: User): Promise<TwitterRecord> {
    const record = await this.recordRepository.findRecordByIdOrThrow(recordId);

    const abilityToCommentOnRecords = await this.recordPermissionsService.defineCurrentUserAbilityToCommentOnAuthorRecordsOrThrow({
      currentUser,
      author: { id: record.authorId } as User,
    });

    ForbiddenError.from(abilityToCommentOnRecords).throwUnlessCan('comment', record);

    const recordPrivacySettings = new RecordPrivacySettings();

    const comment = new TwitterRecord({
      ...options,
      authorId: currentUser.id,
      parentRecordId: recordId,
      privacySettings: recordPrivacySettings,
    });

    await this.recordRepository.saveComment(comment);

    return comment;
  }

  public async deleteComment(commentId: string, currentUser: User): Promise<TwitterRecord> {
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
  ): Promise<TwitterRecord> {
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

  public async getRecordCommentsTrees(recordId: string): Promise<TwitterRecord[]> {
    return this.recordRepository.findTreesOfRecordCommentsByRecordId(recordId);
  }

  public async getCommentsByAuthorIds(
    ids: string[],
    paginationOptions: PaginationOptions,
    currentUser: User,
  ): Promise<Paginated<TwitterRecord>> {
    const { data: comments, ...paginationMetadata } = await this.recordRepository.findCommentsByAuthorIds(ids, paginationOptions);

    const commentsAllowedToView = await asyncFilter(comments, async (comment) => {
      return this.recordPermissionsService.canCurrentUserViewRecord(currentUser, comment);
    });

    return { data: commentsAllowedToView, ...paginationMetadata };
  }

  public async getCommentsByAuthorId(
    authorId: string,
    paginationOptions: PaginationOptions,
    currentUser: User,
  ): Promise<Paginated<TwitterRecord>> {
    const abilityToCommentOnRecords = await this.recordPermissionsService.defineCurrentUserAbilityToCommentOnAuthorRecordsOrThrow({
      currentUser,
      author: { id: authorId } as User,
    });

    const { data: comments, ...paginationMetadata } = await this.recordRepository.findCommentsByAuthorIdOrThrow(
      authorId,
      paginationOptions,
    );

    const commentsAllowedToView = comments.filter((comment) => abilityToCommentOnRecords.can('view', comment));

    return { data: commentsAllowedToView, ...paginationMetadata };
  }
}
