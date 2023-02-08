import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, In, IsNull, Not, TreeRepository } from 'typeorm';

import { Paginated, PaginationOptions } from 'common/pagination';
import { SortOptions } from 'common/sort';

import { COMMENT_IMAGES_DESTINATION } from '../../comment/constants/comment-images-destination.constant';
import { QUOTE_IMAGES_DESTINATION } from '../../quote/constants/quote-images-destination.constant';
import { TWEET_IMAGES_DESTINATION } from '../../tweet/constants/tweet-images-destination.constant';
import { UserNotExistException } from '../../users/exceptions/user-not-exist.exception';
import { UsersRepository } from '../../users/repositories/users.repository';
import { TwitterRecord } from '../entities/twitter-record.entity';
import { RecordsSortType } from '../enums/records-sort-type.enum';
import { RecordAlreadyExistsException } from '../exceptions/record-already-exists.exception';
import { RecordNotExistException } from '../exceptions/record-not-exist.exception';

import { RecordImageRepository } from './record-image.repository';

@Injectable()
export class TwitterRecordRepository {
  constructor(
    @InjectRepository(TwitterRecord) private readonly typeormRepository: TreeRepository<TwitterRecord>,
    private readonly usersRepository: UsersRepository,
    private readonly recordImageRepository: RecordImageRepository,
  ) {}

  public async incrementRecordLikesCountByRecordId(recordId: string): Promise<void> {
    const { likesCount } = await this.typeormRepository.findOne({ where: { id: recordId }, select: { likesCount: true } });

    await this.typeormRepository.update({ id: recordId }, { likesCount: likesCount + 1 });
  }

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

  public async findRecordById(id: string): Promise<TwitterRecord> {
    if (!id) {
      return null;
    }

    const record = await this.typeormRepository.findOne({
      where: { id, isDeleted: false },
      relations: {
        images: true,
        likes: true,
        parentRecord: {
          images: true,
          likes: true,
        },
        privacySettings: {
          usersExceptedFromCommentingRules: true,
          usersExceptedFromViewingRules: true,
        },
      },
    });

    return record;
  }

  public async findRecordsByAuthorIdOrThrow(
    authorId: string,
    paginationOptions: PaginationOptions,
    sortOptions: SortOptions<RecordsSortType>,
  ): Promise<Paginated<TwitterRecord>> {
    const doesAuthorExist = await this.usersRepository.checkIfUserExistsById(authorId);

    if (!doesAuthorExist) {
      throw new UserNotExistException();
    }

    return this.findRecordsByAuthorIds([authorId], paginationOptions, sortOptions);
  }

  public async findRecordsByAuthorIds(
    authorIds: string[],
    paginationOptions: PaginationOptions,
    sortOptions: SortOptions<RecordsSortType>,
  ): Promise<Paginated<TwitterRecord>> {
    const take = paginationOptions.take || 0;
    const skip = (paginationOptions.page - 1) * take;

    let orderOptions: FindOptionsOrder<TwitterRecord>;

    if (sortOptions.type === RecordsSortType.CREATION_DATETIME) {
      orderOptions = { createdAt: sortOptions.direction };
    }

    if (sortOptions.type === RecordsSortType.LIKES) {
      orderOptions = { likesCount: sortOptions.direction };
    }

    const [records, total] = await this.typeormRepository.findAndCount({
      where: { isDeleted: false, authorId: In(authorIds) },
      relations: {
        images: true,
        likes: true,
        parentRecord: {
          images: true,
          likes: true,
          privacySettings: {
            usersExceptedFromCommentingRules: true,
            usersExceptedFromViewingRules: true,
          },
        },
        privacySettings: {
          usersExceptedFromCommentingRules: true,
          usersExceptedFromViewingRules: true,
        },
      },
      order: orderOptions,
      take,
      skip,
    });

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

    const record = await this.typeormRepository.findOne({
      where: {
        id,
        isComment: false,
        isQuote: false,
        parentRecordId: IsNull(),
      },
      relations: {
        images: true,
        likes: true,
        privacySettings: {
          usersExceptedFromCommentingRules: true,
          usersExceptedFromViewingRules: true,
        },
      },
    });

    return record;
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

  private async findTreesOfRecordChildrenByRecordId(id: string, depth?: number): Promise<TwitterRecord[]> {
    const parentRecord = await this.findRecordByIdOrThrow(id);

    const parentRecordWithDescendants = await this.typeormRepository.findDescendantsTree(parentRecord, {
      relations: ['images'],
      depth,
    });

    return parentRecordWithDescendants.childRecords;
  }

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

    const take = paginationOptions.take || 0;
    const skip = (paginationOptions.page - 1) * take;

    const [comments, total] = await this.typeormRepository.findAndCount({
      where: { isComment: true, isDeleted: false, parentRecordId: recordId },
      relations: {
        images: true,
        privacySettings: {
          usersExceptedFromCommentingRules: true,
          usersExceptedFromViewingRules: true,
        },
      },
      skip,
      take,
      order: {
        createdAt: 'ASC',
      },
    });

    return { data: comments, total, page: paginationOptions.page, take: take || total };
  }

  public async findCommentById(id: string): Promise<TwitterRecord> {
    if (!id) {
      return null;
    }

    const comment = await this.typeormRepository.findOne({
      where: {
        id,
        isComment: true,
        isDeleted: false,
      },
      relations: {
        images: true,
        likes: true,
        parentRecord: {
          images: true,
          likes: true,
          privacySettings: {
            usersExceptedFromCommentingRules: true,
            usersExceptedFromViewingRules: true,
          },
        },
        privacySettings: {
          usersExceptedFromCommentingRules: true,
          usersExceptedFromViewingRules: true,
        },
      },
    });

    return comment;
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
    const retweet = await this.typeormRepository.findOne({
      where: { authorId, isComment: false, isQuote: false, parentRecordId: retweetedRecordId },
      relations: {
        images: true,
        likes: true,
        parentRecord: {
          images: true,
          likes: true,
        },
        privacySettings: {
          usersExceptedFromCommentingRules: true,
          usersExceptedFromViewingRules: true,
        },
      },
    });

    return retweet;
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

    const retweet = await this.typeormRepository.findOne({
      where: { id, isComment: false, isQuote: false, parentRecordId: Not(IsNull()) },
      relations: {
        images: true,
        likes: true,
        parentRecord: {
          images: true,
          likes: true,
        },
        privacySettings: {
          usersExceptedFromCommentingRules: true,
          usersExceptedFromViewingRules: true,
        },
      },
    });

    return retweet;
  }

  public async findQuoteById(id: string): Promise<TwitterRecord> {
    if (!id) {
      return null;
    }

    const quote = await this.typeormRepository.findOne({
      where: { id, isQuote: true },
      relations: {
        images: true,
        likes: true,
        parentRecord: {
          images: true,
          likes: true,
          privacySettings: {
            usersExceptedFromCommentingRules: true,
            usersExceptedFromViewingRules: true,
          },
        },
        privacySettings: {
          usersExceptedFromCommentingRules: true,
          usersExceptedFromViewingRules: true,
        },
      },
    });

    return quote;
  }

  public async findQuoteByIdOrThrow(id: string): Promise<TwitterRecord> {
    const quote = await this.findQuoteById(id);

    if (!quote) {
      throw new RecordNotExistException();
    }

    return quote;
  }
}
