import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, TreeRepository } from 'typeorm';

import { Comment } from '../../comment/entities/comment.entity';
import { Quote } from '../../quote/entities/quote.entity';
import { Retweet } from '../../retweet/entities/retweet.entity';
import { Tweet } from '../../tweet/entities/tweet.entity';
import { UserNotExistException } from '../../users/exceptions/user-not-exist.exception';
import { UsersRepository } from '../../users/repositories/users.repository';
import { TwitterRecord } from '../entities/twitter-record.entity';
import { RecordAlreadyExistsException } from '../exceptions/record-already-exists.exception';
import { RecordNotExistException } from '../exceptions/record-not-exist.exception';

@Injectable()
export class TwitterRecordRepository {
  constructor(
    @InjectRepository(TwitterRecord) private readonly typeormRepository: TreeRepository<TwitterRecord>,
    private readonly usersRepository: UsersRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  public async saveTweet(tweet: Tweet): Promise<void> {
    const record = await this.mapper.mapAsync(tweet, Tweet, TwitterRecord);

    await this.typeormRepository.save(record);

    const savedRecord = await this.findRecordByIdOrThrow(record.id);

    Object.assign(tweet, await this.mapper.mapAsync(savedRecord, TwitterRecord, Tweet));
  }

  public async saveComment(comment: Comment): Promise<void> {
    const record = await this.mapper.mapAsync(comment, Comment, TwitterRecord);

    const commentedRecord = await this.findRecordByIdOrThrow(comment.commentedRecordId);

    record.isComment = true;
    record.parentRecord = commentedRecord;

    await this.typeormRepository.save(record);

    const savedRecord = await this.findRecordByIdOrThrow(record.id);

    Object.assign(comment, await this.mapper.mapAsync(savedRecord, TwitterRecord, Comment));
  }

  public async saveRetweetIfNotExistOrThrow(retweet: Retweet): Promise<void> {
    const record = await this.mapper.mapAsync(retweet, Retweet, TwitterRecord);

    const existingRetweet = await this.findRetweetByAuthorAndRetweetedRecordIds(retweet.authorId, retweet.retweetedRecordId);

    if (existingRetweet) {
      throw new RecordAlreadyExistsException();
    }

    const retweetedRecord = await this.findRecordByIdOrThrow(retweet.retweetedRecordId);

    record.parentRecord = retweetedRecord;

    await this.typeormRepository.save(record);

    const savedRecord = await this.findRecordByIdOrThrow(record.id);

    Object.assign(retweet, await this.mapper.mapAsync(savedRecord, TwitterRecord, Retweet));
  }

  public async saveQuote(quote: Quote): Promise<void> {
    const record = await this.mapper.mapAsync(quote, Quote, TwitterRecord);

    const quotedRecord = await this.findRecordByIdOrThrow(quote.quotedRecordId);

    record.parentRecord = quotedRecord;
    record.isQuote = true;

    await this.typeormRepository.save(record);

    const savedRecord = await this.findRecordByIdOrThrow(record.id);

    Object.assign(quote, this.mapper.map(savedRecord, TwitterRecord, Quote));
  }

  public async deleteByIdOrThrow(id: string): Promise<void> {
    const doesRecordExist = await this.checkIfRecordExistsById(id);

    if (!doesRecordExist) {
      throw new RecordNotExistException();
    }

    await this.typeormRepository.delete({ id });
  }

  public async deleteCommentById(id: string): Promise<Comment> {
    const comment = await this.findRecordByIdOrThrow(id);

    const childComments = await this.typeormRepository.findDescendants(comment);

    if (childComments.length !== 0) {
      comment.isDeleted = true;
      await this.typeormRepository.save(comment);

      return this.mapper.mapAsync(comment, TwitterRecord, Comment);
    }

    await this.deleteByIdOrThrow(id);

    return this.mapper.mapAsync(comment, TwitterRecord, Comment);
  }

  public async findRecordByIdOrThrow(id: string): Promise<TwitterRecord> {
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

    if (!record) {
      throw new RecordNotExistException();
    }

    return record;
  }

  public async findTweetsByAuthorIdOrThrow(authorId: string): Promise<Tweet[]> {
    const doesAuthorExist = await this.usersRepository.checkIfUserExistsById(authorId);

    if (!doesAuthorExist) {
      throw new UserNotExistException();
    }

    const records = await this.typeormRepository.find({
      where: { authorId, isComment: false, isQuote: false, parentRecordId: IsNull() },
      relations: {
        images: true,
        likes: true,
        privacySettings: {
          usersExceptedFromCommentingRules: true,
          usersExceptedFromViewingRules: true,
        },
      },
    });

    return this.mapper.mapArrayAsync(records, TwitterRecord, Tweet);
  }

  public async findTweetByIdOrThrow(id: string): Promise<Tweet> {
    const record = await this.typeormRepository.findOne({
      where: {
        id,
        isComment: true,
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

    return this.mapper.mapAsync(record, TwitterRecord, Tweet);
  }

  public async checkIfRecordExistsById(id: string): Promise<boolean> {
    return this.typeormRepository.createQueryBuilder().where({ id }).getExists();
  }

  private async findTreesOfRecordChildrenByRecordId(id: string): Promise<TwitterRecord[]> {
    const parentRecord = await this.findRecordByIdOrThrow(id);

    const parentRecordWithDescendants = await this.typeormRepository.findDescendantsTree(parentRecord, { relations: ['images'] });

    return parentRecordWithDescendants.childRecords;
  }

  public async findTreesOfRecordCommentsByRecordId(id: string): Promise<Comment[]> {
    const recordChildren = await this.findTreesOfRecordChildrenByRecordId(id);

    const comments = recordChildren.filter((child) => child.isComment === true);

    return this.mapper.mapArrayAsync(comments, TwitterRecord, Comment);
  }

  public async findCommentByIdOrThrow(id: string): Promise<Comment> {
    const record = await this.typeormRepository.findOne({
      where: {
        id,
        isComment: true,
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

    return this.mapper.mapAsync(record, TwitterRecord, Comment);
  }

  public async findRetweetsByAuthorId(authorId: string): Promise<Retweet[]> {
    const records = await this.typeormRepository.find({
      where: { authorId, isComment: false, isQuote: false, parentRecordId: Not(IsNull()) },
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

    return this.mapper.mapArrayAsync(records, TwitterRecord, Retweet);
  }

  public async findRetweetByIdOrThrow(id: string): Promise<Retweet> {
    const retweet = await this.findRetweetById(id);

    if (!retweet) {
      throw new RecordNotExistException();
    }

    return retweet;
  }

  public async findRetweetByAuthorAndRetweetedRecordIds(authorId: string, retweetedRecordId: string): Promise<Retweet> {
    const record = await this.typeormRepository.findOne({
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

    return this.mapper.mapAsync(record, TwitterRecord, Retweet);
  }

  public async findRetweetByAuthorAndRetweetedRecordIdsOrThrow(authorId: string, retweetedRecordId: string): Promise<Retweet> {
    const retweet = await this.findRetweetByAuthorAndRetweetedRecordIds(authorId, retweetedRecordId);

    if (!retweet) {
      throw new RecordNotExistException();
    }

    return retweet;
  }

  public async findRetweetById(id: string): Promise<Retweet> {
    const record = await this.typeormRepository.findOne({
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

    return this.mapper.mapAsync(record, TwitterRecord, Retweet);
  }

  public async findQuoteByIdOrThrow(id: string): Promise<Quote> {
    const record = await this.typeormRepository.findOne({
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

    if (!record) {
      throw new RecordNotExistException();
    }

    return this.mapper.mapAsync(record, TwitterRecord, Quote);
  }

  public async findQuotesByAuthorIdOrThrow(authorId: string): Promise<Quote[]> {
    const doesAuthorExist = await this.usersRepository.checkIfUserExistsById(authorId);

    if (!doesAuthorExist) {
      throw new UserNotExistException();
    }

    const records = await this.typeormRepository.find({
      where: {
        authorId,
        isQuote: true,
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

    return this.mapper.mapArrayAsync(records, TwitterRecord, Quote);
  }
}
