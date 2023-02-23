import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Paginated, PaginationOptions } from 'common/pagination';

import { ChatMember } from '../entities/chat-member.entity';
import { Chat } from '../entities/chat.entity';
import { ChatType } from '../enums/chat-type.enum';
import { ChatAlreadyExistsException } from '../exceptions/chat-already-exists.exception';
import { ChatNotExistException } from '../exceptions/chat-not-exist.exception';

@Injectable()
export class ChatRepository {
  constructor(@InjectRepository(Chat) private readonly typeormRepository: Repository<Chat>) {}

  public async addPrivateChat(chat: Chat): Promise<void> {
    const firstMemberId = chat.members[0].userId;
    const secondMemberId = chat.members[1]?.userId;

    let doesChatAlreadyExist: boolean;

    if (secondMemberId) {
      doesChatAlreadyExist = await this.checkIfPrivateChatExistsByMemberIds(firstMemberId, secondMemberId);
    } else {
      doesChatAlreadyExist = await this.checkIfPrivateChatWithTheOnlyMemberExistsByMemberId(firstMemberId);
    }

    if (doesChatAlreadyExist) {
      throw new ChatAlreadyExistsException();
    }

    chat.type = ChatType.PRIVATE;

    await this.typeormRepository.save(chat);

    const savedChat = await this.findOneById(chat.id);

    Object.assign(chat, savedChat);
  }

  public async addGroupChat(chat: Chat): Promise<void> {
    chat.type = ChatType.GROUP;

    await this.typeormRepository.save(chat);

    const savedChat = await this.findOneById(chat.id);

    Object.assign(chat, savedChat);
  }

  public async findOneById(id: string): Promise<Chat> {
    return this.typeormRepository.findOne({
      where: { id },
      relations: {
        members: true,
      },
    });
  }

  public async findByIdOrThrow(id: string): Promise<Chat> {
    const chat = await this.findOneById(id);

    if (!chat) {
      throw new ChatNotExistException();
    }

    return chat;
  }

  public async findManyWithMemberByMemberId(memberId: string, paginationOptions: PaginationOptions): Promise<Paginated<Chat>> {
    const queryBuilder = await this.typeormRepository.createQueryBuilder('c');

    const subQueryForChatMemberExistenceCheck = queryBuilder
      .subQuery()
      .select('cm.id')
      .from(ChatMember, 'cm')
      .where('cm.chatId = c.id')
      .andWhere('cm.userId = :memberId', { memberId });

    queryBuilder.leftJoinAndSelect('c.members', 'cm').whereExists(subQueryForChatMemberExistenceCheck);

    let take = paginationOptions.take;

    if (take === Infinity || take === null || take === undefined) {
      take = 0;
    }

    const skip = (paginationOptions.page - 1) * take;

    queryBuilder.skip(skip).take(take);

    const [chats, total] = await queryBuilder.getManyAndCount();

    return { data: chats, page: paginationOptions.page || 1, total, take: take || total };
  }

  private async checkIfPrivateChatWithTheOnlyMemberExistsByMemberId(memberId: string): Promise<boolean> {
    const queryBuilder = await this.typeormRepository.createQueryBuilder('c');

    const subQueryForChatMemberExistenceCheck = queryBuilder
      .subQuery()
      .from(ChatMember, 'cm')
      .where('cm.chatId = c.id')
      .andWhere('cm.userId = :memberId', { memberId });

    const chatMembersCount = queryBuilder
      .subQuery()
      .select('CAST(COUNT(cms.chatId) AS int)', 'cm_count')
      .from(ChatMember, 'cms')
      .where('cms.chatId = c.id')
      .getQuery();

    queryBuilder.where('c.type = :private', { private: ChatType.PRIVATE });

    queryBuilder.andWhereExists(subQueryForChatMemberExistenceCheck);
    queryBuilder.andWhere(`${chatMembersCount} = 1`);

    return queryBuilder.getExists();
  }

  private async checkIfPrivateChatExistsByMemberIds(firstMemberId: string, secondMemberId: string): Promise<boolean> {
    const queryBuilder = await this.typeormRepository.createQueryBuilder('c');

    const subQueryForFirstChatMemberExistenceCheck = queryBuilder
      .subQuery()
      .from(ChatMember, 'cm1')
      .where('cm1.chatId = c.id')
      .andWhere('cm1.userId = :firstMemberId', { firstMemberId });

    const subQueryForSecondChatMemberExistenceCheck = await queryBuilder
      .subQuery()
      .from(ChatMember, 'cm2')
      .where('cm2.chatId = c.id')
      .andWhere('cm2.userId = :secondMemberId', { secondMemberId });

    queryBuilder.where('c.type = :private', { private: ChatType.PRIVATE });

    queryBuilder.andWhereExists(subQueryForFirstChatMemberExistenceCheck);
    queryBuilder.andWhereExists(subQueryForSecondChatMemberExistenceCheck);

    return queryBuilder.getExists();
  }
}
