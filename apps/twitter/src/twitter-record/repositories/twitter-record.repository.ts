import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, SelectQueryBuilder, TreeRepository } from 'typeorm';

import { Paginated, PaginationOptions } from 'common/pagination';
import { SortOptions } from 'common/sort';

import { COMMENT_IMAGES_DESTINATION } from '../../comment/constants/comment-images-destination.constant';
import { QUOTE_IMAGES_DESTINATION } from '../../quote/constants/quote-images-destination.constant';
import { RecordLike } from '../../record-likes/entities/record-like.entity';
import { TWEET_IMAGES_DESTINATION } from '../../tweet/constants/tweet-images-destination.constant';
import { UserNotExistException } from '../../users/exceptions/user-not-exist.exception';
import { UsersRepository } from '../../users/repositories/users.repository';
import { TwitterRecord } from '../entities/twitter-record.entity';
import { RecordsSortType } from '../enums/records-sort-type.enum';
import { RecordAlreadyExistsException } from '../exceptions/record-already-exists.exception';
import { RecordNotExistException } from '../exceptions/record-not-exist.exception';
import { RecordsFiltrationOptions } from '../services/find-records-service.options';

import { RecordImageRepository } from './record-image.repository';

@Injectable()
export class TwitterRecordRepository {
  constructor(
    @InjectRepository(TwitterRecord) private readonly typeormRepository: TreeRepository<TwitterRecord>,
    private readonly usersRepository: UsersRepository,
    private readonly recordImageRepository: RecordImageRepository,
  ) {}

  public async saveTweet(tweet: TwitterRecord): Promise<void> {
    const existingTweet = await this.findTweetById(tweet.id);

    if (existingTweet) {
      const imagesToDelete = existingTweet.images.filter((existingTweetImage) => {
        return tweet.images.every((tweetImage) => existingTweetImage.id !== tweetImage.id);
      });

      await this.recordImageRepository.deleteRecordImages(imagesToDelete);
    }

    await this.recordImageRepository.defineRecordImagePathsIfNotDefined(tweet.images, TWEET_IMAGES_DESTINATION);

    await this.typeormRepository.save(tweet);

    const savedTweet = await this.findTweetByIdOrThrow(tweet.id);

    Object.assign(tweet, savedTweet);
  }

  public async saveComment(comment: TwitterRecord): Promise<void> {
    const existingComment = await this.findCommentById(comment.id);

    if (existingComment) {
      const imagesToDelete = existingComment.images.filter((existingCommentImage) => {
        return comment.images.some((commentImage) => existingCommentImage.id !== commentImage.id);
      });

      await this.recordImageRepository.deleteRecordImages(imagesToDelete);
    }

    const commentedRecord = await this.findRecordByIdOrThrow(comment.parentRecordId);

    commentedRecord.commentsCount = commentedRecord.commentsCount + 1;

    await this.typeormRepository.save(commentedRecord);

    comment.isComment = true;
    comment.parentRecord = commentedRecord;

    await this.recordImageRepository.defineRecordImagePathsIfNotDefined(comment.images, COMMENT_IMAGES_DESTINATION);

    await this.typeormRepository.save(comment);

    const savedComment = await this.findCommentByIdOrThrow(comment.id);

    Object.assign(comment, savedComment);
  }

  public async saveRetweetIfNotExistOrThrow(retweet: TwitterRecord): Promise<void> {
    const existingRetweet = await this.findRetweetByAuthorAndRetweetedRecordIds(retweet.authorId, retweet.parentRecordId);

    if (existingRetweet) {
      throw new RecordAlreadyExistsException();
    }

    const retweetedRecord = await this.findRecordByIdOrThrow(retweet.parentRecordId);

    retweet.parentRecord = retweetedRecord;

    await this.typeormRepository.save(retweet);

    const savedRetweet = await this.findRecordByIdOrThrow(retweet.id);

    Object.assign(retweet, savedRetweet);
  }

  public async saveQuote(quote: TwitterRecord): Promise<void> {
    const existingQuote = await this.findQuoteById(quote.id);

    if (existingQuote) {
      const imagesToDelete = existingQuote.images.filter((existingQuoteImage) => {
        return quote.images.some((quoteImage) => existingQuoteImage.id !== quoteImage.id);
      });

      await this.recordImageRepository.deleteRecordImages(imagesToDelete);
    }

    const quotedRecord = await this.findRecordByIdOrThrow(quote.parentRecordId);

    quote.parentRecord = quotedRecord;
    quote.isQuote = true;

    await this.recordImageRepository.defineRecordImagePathsIfNotDefined(quote.images, QUOTE_IMAGES_DESTINATION);

    await this.typeormRepository.save(quote);

    const savedQuote = await this.findQuoteByIdOrThrow(quote.id);

    Object.assign(quote, savedQuote);
  }

  public async deleteByIdOrThrow(id: string): Promise<void> {
    const { images } = await this.findRecordByIdOrThrow(id);

    await this.recordImageRepository.deleteRecordImages(images);

    await this.typeormRepository.delete({ id });
  }

  public async deleteCommentById(id: string): Promise<TwitterRecord> {
    const comment = await this.findRecordByIdOrThrow(id);

    const childComments = await this.typeormRepository.findDescendants(comment);

    await this.recordImageRepository.deleteRecordImages(comment.images);

    if (childComments.length !== 0) {
      comment.isDeleted = true;

      await this.typeormRepository.save(comment);

      return comment;
    }

    await this.deleteByIdOrThrow(id);

    return comment;
  }

  private addRecordImagesJoining(
    qb: SelectQueryBuilder<TwitterRecord>,
    recordAlias: string,
    imagesAlias: string,
  ): SelectQueryBuilder<TwitterRecord> {
    return qb.leftJoinAndSelect(`${recordAlias}.images`, imagesAlias);
  }

  private addRecordPrivacySettingsJoining(
    qb: SelectQueryBuilder<TwitterRecord>,
    recordAlias: string,
  ): SelectQueryBuilder<TwitterRecord> {
    return qb
      .leftJoinAndSelect(`${recordAlias}.privacySettings`, `${recordAlias}PrivacySettings`)
      .leftJoinAndSelect(
        `${recordAlias}PrivacySettings.usersExceptedFromCommentingRules`,
        `${recordAlias}UsersExceptedFromCommentingRules`,
      )
      .leftJoinAndSelect(`${recordAlias}PrivacySettings.usersExceptedFromViewingRules`, `${recordAlias}UsersExceptedFromViewingRules`);
  }

  private addRecordLikesCountMapping(qb: SelectQueryBuilder<TwitterRecord>, recordAlias: string): SelectQueryBuilder<TwitterRecord> {
    return qb.loadRelationCountAndMap(`${recordAlias}.likesCount`, `${recordAlias}.likes`);
  }

  private addRecordCommentsCountMapping(
    qb: SelectQueryBuilder<TwitterRecord>,
    recordAlias: string,
  ): SelectQueryBuilder<TwitterRecord> {
    return qb.loadRelationCountAndMap(`${recordAlias}.commentsCount`, `${recordAlias}.childRecords`, `${recordAlias}Comment`, (qb) => {
      return qb.where(`${recordAlias}Comment.isComment = :isComment`, { isComment: true });
    });
  }

  private getSubQueryForLikesCountSelection(
    qb: SelectQueryBuilder<TwitterRecord>,
    recordAlias: string,
    likesCountAlias: string,
  ): string {
    return qb
      .subQuery()
      .select('COUNT(like.recordId)', likesCountAlias)
      .from(RecordLike, 'like')
      .where(`like.recordId = ${recordAlias}.id`)
      .getQuery();
  }

  private addRecordLikesCountSelection(
    qb: SelectQueryBuilder<TwitterRecord>,
    recordAlias: string,
    likesCountAlias: string,
  ): SelectQueryBuilder<TwitterRecord> {
    const subQueryForLikesCountSelection = this.getSubQueryForLikesCountSelection(qb, recordAlias, likesCountAlias);

    return qb.addSelect(subQueryForLikesCountSelection, likesCountAlias);
  }

  public async findRecordById(id: string): Promise<TwitterRecord> {
    if (!id) {
      return null;
    }

    const recordAlias = 'record';

    const queryBuilder = await this.typeormRepository.createQueryBuilder(recordAlias);

    const recordImagesAlias = 'recordImages';

    this.addRecordImagesJoining(queryBuilder, recordAlias, recordImagesAlias);
    this.addRecordPrivacySettingsJoining(queryBuilder, recordAlias);
    this.addRecordLikesCountMapping(queryBuilder, recordAlias);
    this.addRecordCommentsCountMapping(queryBuilder, recordAlias);

    const recordLikesCountAlias = 'likes_count';

    this.addRecordLikesCountSelection(queryBuilder, recordAlias, recordLikesCountAlias);

    const parentRecordAlias = 'parentRecord';

    queryBuilder.leftJoinAndSelect(`${recordAlias}.parentRecord`, parentRecordAlias);

    const parentRecordImagesAlias = 'parentRecordImages';

    this.addRecordImagesJoining(queryBuilder, parentRecordAlias, parentRecordImagesAlias);
    this.addRecordPrivacySettingsJoining(queryBuilder, parentRecordAlias);
    this.addRecordLikesCountMapping(queryBuilder, parentRecordAlias);
    this.addRecordCommentsCountMapping(queryBuilder, parentRecordAlias);

    queryBuilder.where(`${recordAlias}.id = :id`, { id });

    return queryBuilder.getOne();
  }

  public async findManyRecords(
    filtrationOptions: RecordsFiltrationOptions,
    paginationOptions: PaginationOptions,
    sortOptions: SortOptions<RecordsSortType>,
  ): Promise<Paginated<TwitterRecord>> {
    const recordAlias = 'record';

    const queryBuilder = await this.typeormRepository.createQueryBuilder(recordAlias);

    const recordImagesAlias = 'recordImages';

    this.addRecordImagesJoining(queryBuilder, recordAlias, recordImagesAlias);
    this.addRecordPrivacySettingsJoining(queryBuilder, recordAlias);
    this.addRecordLikesCountMapping(queryBuilder, recordAlias);
    this.addRecordCommentsCountMapping(queryBuilder, recordAlias);

    const recordLikesCountAlias = 'likes_count';

    this.addRecordLikesCountSelection(queryBuilder, recordAlias, recordLikesCountAlias);

    const parentRecordAlias = 'parentRecord';

    queryBuilder.leftJoinAndSelect(`${recordAlias}.parentRecord`, parentRecordAlias);

    const parentRecordImagesAlias = 'parentRecordImages';

    this.addRecordImagesJoining(queryBuilder, parentRecordAlias, parentRecordImagesAlias);
    this.addRecordPrivacySettingsJoining(queryBuilder, parentRecordAlias);
    this.addRecordLikesCountMapping(queryBuilder, parentRecordAlias);
    this.addRecordCommentsCountMapping(queryBuilder, parentRecordAlias);

    queryBuilder.where(`${recordAlias}.isDeleted = :isDeleted`, { isDeleted: false });

    if (filtrationOptions.onlyWithMedia) {
      queryBuilder.andWhere(`${recordImagesAlias}.id IS NOT NULL`);
    }

    if (filtrationOptions.excludeComments) {
      queryBuilder.andWhere(`${recordAlias}.isComment = :isComment`, { isComment: false });
    }

    let orderBy: string = null;

    if (sortOptions.type === RecordsSortType.CREATION_DATETIME) {
      orderBy = `${recordAlias}.createdAt`;
    }

    if (sortOptions.type === RecordsSortType.LIKES_COUNT) {
      orderBy = recordLikesCountAlias;
    }

    queryBuilder.orderBy(orderBy, sortOptions.direction);

    const take = paginationOptions.take || 0;
    const skip = (paginationOptions.page - 1) * take;

    queryBuilder.skip(skip).take(take);

    const [records, total] = await queryBuilder.getManyAndCount();

    return { data: records, page: paginationOptions.page, total, take: take || total };
  }

  public async findRecordsByAuthorIdOrThrow(
    authorId: string,
    filtrationOptions: RecordsFiltrationOptions,
    paginationOptions: PaginationOptions,
    sortOptions: SortOptions<RecordsSortType>,
  ): Promise<Paginated<TwitterRecord>> {
    const doesAuthorExist = await this.usersRepository.checkIfUserExistsById(authorId);

    if (!doesAuthorExist) {
      throw new UserNotExistException();
    }

    return this.findRecordsByAuthorIds([authorId], filtrationOptions, paginationOptions, sortOptions);
  }

  public async findRecordsByAuthorIds(
    authorIds: string[],
    filtrationOptions: RecordsFiltrationOptions,
    paginationOptions: PaginationOptions,
    sortOptions: SortOptions<RecordsSortType>,
  ): Promise<Paginated<TwitterRecord>> {
    const recordAlias = 'record';

    const queryBuilder = await this.typeormRepository.createQueryBuilder(recordAlias);

    const recordImagesAlias = 'recordImages';

    this.addRecordImagesJoining(queryBuilder, recordAlias, recordImagesAlias);
    this.addRecordPrivacySettingsJoining(queryBuilder, recordAlias);
    this.addRecordLikesCountMapping(queryBuilder, recordAlias);
    this.addRecordCommentsCountMapping(queryBuilder, recordAlias);

    const recordLikesCountAlias = 'likes_count';

    this.addRecordLikesCountSelection(queryBuilder, recordAlias, recordLikesCountAlias);

    const parentRecordAlias = 'parentRecord';

    queryBuilder.leftJoinAndSelect(`${recordAlias}.parentRecord`, parentRecordAlias);

    const parentRecordImagesAlias = 'parentRecordImages';

    this.addRecordImagesJoining(queryBuilder, parentRecordAlias, parentRecordImagesAlias);
    this.addRecordPrivacySettingsJoining(queryBuilder, parentRecordAlias);
    this.addRecordLikesCountMapping(queryBuilder, parentRecordAlias);
    this.addRecordCommentsCountMapping(queryBuilder, parentRecordAlias);

    queryBuilder.where({ authorId: In(authorIds) }).andWhere(`${recordAlias}.isDeleted = :isDeleted`, { isDeleted: false });

    if (filtrationOptions.onlyWithMedia) {
      queryBuilder.andWhere(`${recordImagesAlias}.id IS NOT NULL`);
    }

    if (filtrationOptions.excludeComments) {
      queryBuilder.andWhere(`${recordAlias}.isComment = :isComment`, { isComment: false });
    }

    let orderBy: string = null;

    if (sortOptions.type === RecordsSortType.CREATION_DATETIME) {
      orderBy = `${recordAlias}.createdAt`;
    }

    if (sortOptions.type === RecordsSortType.LIKES_COUNT) {
      orderBy = recordLikesCountAlias;
    }

    queryBuilder.orderBy(orderBy, sortOptions.direction);

    const take = paginationOptions.take || 0;
    const skip = (paginationOptions.page - 1) * take;

    queryBuilder.skip(skip).take(take);

    const [records, total] = await queryBuilder.getManyAndCount();

    return { data: records, page: paginationOptions.page, total, take: take || total };
  }

  public async findRecordsByIds(
    ids: string[],
    filtrationOptions: RecordsFiltrationOptions,
    paginationOptions: PaginationOptions,
    sortOptions: SortOptions<RecordsSortType>,
  ): Promise<Paginated<TwitterRecord>> {
    const recordAlias = 'record';

    const queryBuilder = await this.typeormRepository.createQueryBuilder(recordAlias);

    const recordImagesAlias = 'recordImages';

    this.addRecordImagesJoining(queryBuilder, recordAlias, recordImagesAlias);
    this.addRecordPrivacySettingsJoining(queryBuilder, recordAlias);
    this.addRecordLikesCountMapping(queryBuilder, recordAlias);
    this.addRecordCommentsCountMapping(queryBuilder, recordAlias);

    const recordLikesCountAlias = 'likes_count';

    this.addRecordLikesCountSelection(queryBuilder, recordAlias, recordLikesCountAlias);

    const parentRecordAlias = 'parentRecord';

    queryBuilder.leftJoinAndSelect(`${recordAlias}.parentRecord`, parentRecordAlias);

    const parentRecordImagesAlias = 'parentRecordImages';

    this.addRecordImagesJoining(queryBuilder, parentRecordAlias, parentRecordImagesAlias);
    this.addRecordPrivacySettingsJoining(queryBuilder, parentRecordAlias);
    this.addRecordLikesCountMapping(queryBuilder, parentRecordAlias);
    this.addRecordCommentsCountMapping(queryBuilder, parentRecordAlias);

    queryBuilder.where({ id: In(ids) }).andWhere('record.isDeleted = :isDeleted', { isDeleted: false });

    if (filtrationOptions.onlyWithMedia) {
      queryBuilder.andWhere(`${recordImagesAlias}.id IS NOT NULL`);
    }

    if (filtrationOptions.excludeComments) {
      queryBuilder.andWhere(`${recordAlias}.isComment = :isComment`, { isComment: false });
    }

    let orderBy: string = null;

    if (sortOptions.type === RecordsSortType.CREATION_DATETIME) {
      orderBy = `${recordAlias}.createdAt`;
    }

    if (sortOptions.type === RecordsSortType.LIKES_COUNT) {
      orderBy = recordLikesCountAlias;
    }

    queryBuilder.orderBy(orderBy, sortOptions.direction);

    const take = paginationOptions.take || 0;
    const skip = (paginationOptions.page - 1) * take;

    queryBuilder.skip(skip).take(take);

    const [records, total] = await queryBuilder.getManyAndCount();

    return { data: records, page: paginationOptions.page, total, take: take || total };
  }

  public async findRecordByIdOrThrow(id: string): Promise<TwitterRecord> {
    const record = await this.findRecordById(id);

    if (!record) {
      throw new RecordNotExistException();
    }

    return record;
  }

  public async findTweetById(id: string): Promise<TwitterRecord> {
    if (!id) {
      return null;
    }

    const recordAlias = 'tweet';

    const queryBuilder = await this.typeormRepository.createQueryBuilder(recordAlias);

    const recordImagesAlias = 'tweetImages';

    this.addRecordImagesJoining(queryBuilder, recordAlias, recordImagesAlias);
    this.addRecordPrivacySettingsJoining(queryBuilder, recordAlias);
    this.addRecordLikesCountMapping(queryBuilder, recordAlias);
    this.addRecordCommentsCountMapping(queryBuilder, recordAlias);

    const recordLikesCountAlias = 'likes_count';

    this.addRecordLikesCountSelection(queryBuilder, recordAlias, recordLikesCountAlias);

    queryBuilder
      .where(`${recordAlias}.id = :id`, { id })
      .andWhere(`${recordAlias}.isComment = :isComment`, { isComment: false })
      .andWhere(`${recordAlias}.isQuote = :isQuote`, { isQuote: false })
      .andWhere(`${recordAlias}.parentRecordId IS NULL`);

    return queryBuilder.getOne();
  }

  public async findTweetByIdOrThrow(id: string): Promise<TwitterRecord> {
    const tweet = await this.findTweetById(id);

    if (!tweet) {
      throw new RecordNotExistException();
    }

    return tweet;
  }

  public async checkIfRecordExistsById(id: string): Promise<boolean> {
    return this.typeormRepository.createQueryBuilder().where({ id, isDeleted: false }).getExists();
  }

  /**
   * @Deprecated not load likes & comments count.
   */
  private async findTreesOfRecordChildrenByRecordId(id: string, depth?: number): Promise<TwitterRecord[]> {
    const parentRecord = await this.findRecordByIdOrThrow(id);

    const parentRecordWithDescendants = await this.typeormRepository.findDescendantsTree(parentRecord, {
      relations: ['images'],
      depth,
    });

    return parentRecordWithDescendants.childRecords;
  }

  /**
   * @Deprecated not load likes & comments count.
   */
  public async findTreesOfRecordCommentsByRecordId(id: string, depth?: number): Promise<TwitterRecord[]> {
    const recordChildren = await this.findTreesOfRecordChildrenByRecordId(id, depth);

    const comments = recordChildren.filter((child) => child.isComment === true);

    return comments;
  }

  public async findRecordCommentsAsDirectDescendantsByRecordIdOrThrow(
    recordId: string,
    paginationOptions: PaginationOptions,
  ): Promise<Paginated<TwitterRecord>> {
    const doesRecordExist = await this.checkIfRecordExistsById(recordId);

    if (!doesRecordExist) {
      throw new RecordNotExistException();
    }

    const recordAlias = 'comment';

    const queryBuilder = await this.typeormRepository.createQueryBuilder(recordAlias);

    const recordImagesAlias = 'commentImages';

    this.addRecordImagesJoining(queryBuilder, recordAlias, recordImagesAlias);
    this.addRecordPrivacySettingsJoining(queryBuilder, recordAlias);
    this.addRecordLikesCountMapping(queryBuilder, recordAlias);
    this.addRecordCommentsCountMapping(queryBuilder, recordAlias);

    queryBuilder
      .where(`${recordAlias}.parentRecordId = :recordId`, { recordId })
      .andWhere(`${recordAlias}.isComment = :isComment`, { isComment: true });

    queryBuilder.orderBy(`${recordAlias}.createdAt`, 'ASC');

    const take = paginationOptions.take || 0;
    const skip = (paginationOptions.page - 1) * take;

    queryBuilder.skip(skip).take(take);

    const [comments, total] = await queryBuilder.getManyAndCount();

    return { data: comments, total, page: paginationOptions.page, take: take || total };
  }

  public async findCommentById(id: string): Promise<TwitterRecord> {
    if (!id) {
      return null;
    }

    const recordAlias = 'comment';

    const queryBuilder = await this.typeormRepository.createQueryBuilder(recordAlias);

    const recordImagesAlias = 'commentImages';

    this.addRecordImagesJoining(queryBuilder, recordAlias, recordImagesAlias);
    this.addRecordPrivacySettingsJoining(queryBuilder, recordAlias);
    this.addRecordLikesCountMapping(queryBuilder, recordAlias);
    this.addRecordCommentsCountMapping(queryBuilder, recordAlias);

    queryBuilder.where(`${recordAlias}.id = :id`, { id }).andWhere(`${recordAlias}.isComment = :isComment`, { isComment: true });

    return queryBuilder.getOne();
  }

  public async findCommentByIdOrThrow(id: string): Promise<TwitterRecord> {
    const comment = await this.findCommentById(id);

    if (!comment) {
      throw new RecordNotExistException();
    }

    return comment;
  }

  public async findRetweetByIdOrThrow(id: string): Promise<TwitterRecord> {
    const retweet = await this.findRetweetById(id);

    if (!retweet) {
      throw new RecordNotExistException();
    }

    return retweet;
  }

  public async findRetweetByAuthorAndRetweetedRecordIds(authorId: string, retweetedRecordId: string): Promise<TwitterRecord> {
    const recordAlias = 'retweet';

    const queryBuilder = await this.typeormRepository.createQueryBuilder(recordAlias);

    const recordImagesAlias = 'retweetImages';

    this.addRecordImagesJoining(queryBuilder, recordAlias, recordImagesAlias);
    this.addRecordPrivacySettingsJoining(queryBuilder, recordAlias);
    this.addRecordLikesCountMapping(queryBuilder, recordAlias);
    this.addRecordCommentsCountMapping(queryBuilder, recordAlias);

    const recordLikesCountAlias = 'likes_count';

    this.addRecordLikesCountSelection(queryBuilder, recordAlias, recordLikesCountAlias);

    const parentRecordAlias = 'retweetedRecord';

    queryBuilder.leftJoinAndSelect(`${recordAlias}.parentRecord`, parentRecordAlias);

    const parentRecordImagesAlias = 'retweetedRecordImages';

    this.addRecordImagesJoining(queryBuilder, parentRecordAlias, parentRecordImagesAlias);
    this.addRecordPrivacySettingsJoining(queryBuilder, parentRecordAlias);
    this.addRecordLikesCountMapping(queryBuilder, parentRecordAlias);
    this.addRecordCommentsCountMapping(queryBuilder, parentRecordAlias);

    queryBuilder
      .where(`${recordAlias}.authorId = :authorId`, { authorId })
      .andWhere(`${recordAlias}.parentRecordId = :retweetedRecordId`, { retweetedRecordId })
      .andWhere(`${recordAlias}.isComment = :isComment`, { isComment: false })
      .andWhere(`${recordAlias}.isQuote = :isQuote`, { isQuote: false })
      .andWhere(`${recordAlias}.parentRecordId IS NOT NULL`);

    return queryBuilder.getOne();
  }

  public async findRetweetByAuthorAndRetweetedRecordIdsOrThrow(authorId: string, retweetedRecordId: string): Promise<TwitterRecord> {
    const retweet = await this.findRetweetByAuthorAndRetweetedRecordIds(authorId, retweetedRecordId);

    if (!retweet) {
      throw new RecordNotExistException();
    }

    return retweet;
  }

  public async findRetweetById(id: string): Promise<TwitterRecord> {
    if (!id) {
      return null;
    }

    const recordAlias = 'retweet';

    const queryBuilder = await this.typeormRepository.createQueryBuilder(recordAlias);

    const recordImagesAlias = 'retweetImages';

    this.addRecordImagesJoining(queryBuilder, recordAlias, recordImagesAlias);
    this.addRecordPrivacySettingsJoining(queryBuilder, recordAlias);
    this.addRecordLikesCountMapping(queryBuilder, recordAlias);
    this.addRecordCommentsCountMapping(queryBuilder, recordAlias);

    const recordLikesCountAlias = 'likes_count';

    this.addRecordLikesCountSelection(queryBuilder, recordAlias, recordLikesCountAlias);

    const parentRecordAlias = 'retweetedRecord';

    queryBuilder.leftJoinAndSelect(`${recordAlias}.parentRecord`, parentRecordAlias);

    const parentRecordImagesAlias = 'retweetedRecordImages';

    this.addRecordImagesJoining(queryBuilder, parentRecordAlias, parentRecordImagesAlias);
    this.addRecordPrivacySettingsJoining(queryBuilder, parentRecordAlias);
    this.addRecordLikesCountMapping(queryBuilder, parentRecordAlias);
    this.addRecordCommentsCountMapping(queryBuilder, parentRecordAlias);

    queryBuilder
      .where(`${recordAlias}.id = :id`, { id })
      .andWhere(`${recordAlias}.isComment = :isComment`, { isComment: false })
      .andWhere(`${recordAlias}.isQuote = :isQuote`, { isQuote: false })
      .andWhere(`${recordAlias}.parentRecordId IS NOT NULL`);

    return queryBuilder.getOne();
  }

  public async findQuoteById(id: string): Promise<TwitterRecord> {
    if (!id) {
      return null;
    }

    const recordAlias = 'quote';

    const queryBuilder = await this.typeormRepository.createQueryBuilder(recordAlias);

    const recordImagesAlias = 'quoteImages';

    this.addRecordImagesJoining(queryBuilder, recordAlias, recordImagesAlias);
    this.addRecordPrivacySettingsJoining(queryBuilder, recordAlias);
    this.addRecordLikesCountMapping(queryBuilder, recordAlias);
    this.addRecordCommentsCountMapping(queryBuilder, recordAlias);

    const recordLikesCountAlias = 'likes_count';

    this.addRecordLikesCountSelection(queryBuilder, recordAlias, recordLikesCountAlias);

    const parentRecordAlias = 'quotedRecord';

    queryBuilder.leftJoinAndSelect(`${recordAlias}.parentRecord`, parentRecordAlias);

    const parentRecordImagesAlias = 'quotedRecordImages';

    this.addRecordImagesJoining(queryBuilder, parentRecordAlias, parentRecordImagesAlias);
    this.addRecordPrivacySettingsJoining(queryBuilder, parentRecordAlias);
    this.addRecordLikesCountMapping(queryBuilder, parentRecordAlias);
    this.addRecordCommentsCountMapping(queryBuilder, parentRecordAlias);

    queryBuilder.where(`${recordAlias}.id = :id`, { id }).andWhere(`${recordAlias}.isQuote = :isQuote`, { isQuote: true });

    return queryBuilder.getOne();
  }

  public async findQuoteByIdOrThrow(id: string): Promise<TwitterRecord> {
    const quote = await this.findQuoteById(id);

    if (!quote) {
      throw new RecordNotExistException();
    }

    return quote;
  }
}
