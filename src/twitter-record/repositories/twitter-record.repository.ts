import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';

import { UserNotExistException } from '../../users/exceptions/user-not-exist.exception';
import { UsersRepository } from '../../users/repositories/users.repository';
import { TwitterRecord } from '../entities/twitter-record.entity';
import { RecordNotExistException } from '../exceptions/record-not-exist.exception';

@Injectable()
export class TwitterRecordRepository {
  constructor(
    @InjectRepository(TwitterRecord) private readonly typeormRepository: TreeRepository<TwitterRecord>,
    private readonly usersRepository: UsersRepository,
  ) {}

  public async save(twitterRecord: TwitterRecord): Promise<void> {
    await this.typeormRepository.save(twitterRecord);
  }

  public async deleteByIdOrThrow(id: string): Promise<void> {
    const doesRecordExist = await this.checkIfRecordExistsById(id);

    if (!doesRecordExist) {
      throw new RecordNotExistException();
    }

    await this.typeormRepository.delete({ id });
  }

  public async findById(id: string): Promise<TwitterRecord> {
    const record = await this.typeormRepository.findOne({ where: { id }, relations: { images: true } });

    if (!record) {
      throw new RecordNotExistException();
    }

    return record;
  }

  public async findManyByAuthorIdOrThrow(authorId: string): Promise<TwitterRecord[]> {
    const doesAuthorExist = await this.usersRepository.checkIfUserExistsById(authorId);

    if (!doesAuthorExist) {
      throw new UserNotExistException();
    }

    return this.typeormRepository.find({ where: { authorId }, relations: { images: true } });
  }

  public async updateByIdOrThrow(id: string, options: Partial<TwitterRecord>): Promise<TwitterRecord> {
    const doesRecordExist = await this.checkIfRecordExistsById(id);

    if (!doesRecordExist) {
      throw new RecordNotExistException();
    }

    await this.typeormRepository.update({ id }, { ...options });

    return this.findById(id);
  }

  public async checkIfRecordExistsById(id: string): Promise<boolean> {
    return this.typeormRepository.createQueryBuilder().where({ id }).getExists();
  }

  public async findTreesOfRecordChildrenByRecordId(id: string): Promise<TwitterRecord[]> {
    const parentRecord = await this.findById(id);

    const parentRecordWithDescendants = await this.typeormRepository.findDescendantsTree(parentRecord, { relations: ['images'] });

    return parentRecordWithDescendants.childRecords;
  }

  public async findTreesOfRecordCommentsByRecordId(id: string): Promise<TwitterRecord[]> {
    const parentRecord = await this.findById(id);

    const recordChildren = await this.findTreesOfRecordChildrenByRecordId(id);

    return recordChildren.filter((child) => child.isComment === true);
  }

  public async findRetweetsByAuthorId(authorId: string): Promise<TwitterRecord[]> {
    return this.typeormRepository.find({ where: { authorId, isRetweet: true }, relations: { images: true } });
  }
}
