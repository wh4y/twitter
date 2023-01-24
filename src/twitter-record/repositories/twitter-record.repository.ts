import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, TreeRepository } from 'typeorm';

import { UserNotExistException } from '../../users/exceptions/user-not-exist.exception';
import { UsersRepository } from '../../users/repositories/users.repository';
import { Comment } from '../entities/comment.entity';
import { Retweet } from '../entities/retweet.entity';
import { Tweet } from '../entities/tweet.entity';
import { TwitterRecord } from '../entities/twitter-record.entity';
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

    const savedTweet = await this.mapper.mapAsync(record, TwitterRecord, Tweet);

    Object.assign(tweet, savedTweet);
  }

  public async saveComment(comment: Comment): Promise<void> {
    const record = await this.mapper.mapAsync(comment, Comment, TwitterRecord);

    record.isComment = true;

    const commentedRecord = await this.findByIdOrThrow(comment.commentedRecordId);

    record.parentRecord = commentedRecord;

    await this.typeormRepository.save(record);

    const savedComment = await this.mapper.mapAsync(record, TwitterRecord, Comment);

    Object.assign(comment, savedComment);
  }

  public async saveRetweet(retweet: Retweet): Promise<void> {
    const record = await this.mapper.mapAsync(retweet, Retweet, TwitterRecord);

    const retweetedRecord = await this.findByIdOrThrow(retweet.retweetedRecordId);

    record.parentRecord = retweetedRecord;

    await this.typeormRepository.save(record);

    const savedRetweet = await this.mapper.mapAsync(record, TwitterRecord, Retweet);

    Object.assign(retweet, savedRetweet);
  }

  public async deleteByIdOrThrow(id: string): Promise<void> {
    const doesRecordExist = await this.checkIfRecordExistsById(id);

    if (!doesRecordExist) {
      throw new RecordNotExistException();
    }

    await this.typeormRepository.delete({ id });
  }

  private async findByIdOrThrow(id: string): Promise<TwitterRecord> {
    const record = await this.typeormRepository.findOne({ where: { id }, relations: { images: true } });

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

    const records = await this.typeormRepository.find({ where: { authorId }, relations: { images: true } });

    return this.mapper.mapArrayAsync(records, TwitterRecord, Tweet);
  }

  public async checkIfRecordExistsById(id: string): Promise<boolean> {
    return this.typeormRepository.createQueryBuilder().where({ id }).getExists();
  }

  private async findTreesOfRecordChildrenByRecordId(id: string): Promise<TwitterRecord[]> {
    const parentRecord = await this.findByIdOrThrow(id);

    const parentRecordWithDescendants = await this.typeormRepository.findDescendantsTree(parentRecord, { relations: ['images'] });

    return parentRecordWithDescendants.childRecords;
  }

  public async findTreesOfRecordCommentsByRecordId(id: string): Promise<Comment[]> {
    const recordChildren = await this.findTreesOfRecordChildrenByRecordId(id);

    const comments = recordChildren.filter((child) => child.isComment === true);

    return this.mapper.mapArrayAsync(comments, TwitterRecord, Comment);
  }

  public async findRetweetsByAuthorId(authorId: string): Promise<Retweet[]> {
    const records = await this.typeormRepository.find({
      where: { authorId, isComment: false, parentRecordId: Not(null) },
      relations: { images: true },
    });

    return this.mapper.mapArrayAsync(records, TwitterRecord, Retweet);
  }
}
