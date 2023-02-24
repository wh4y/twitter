import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Paginated, PaginationOptions } from 'common/pagination';

import { ChatMember } from '../../entities/chat-member.entity';
import { Chat } from '../../entities/chat.entity';
import { ChatType } from '../../enums/chat-type.enum';
import { ChatAlreadyExistsException } from '../../exceptions/chat-already-exists.exception';
import { ChatMemberNotExistException } from '../../exceptions/chat-member-not-exist.exception';
import { ChatNotExistException } from '../../exceptions/chat-not-exist.exception';

@Injectable()
export class ChatRepository {
  constructor(
    @InjectRepository(Chat) private readonly typeormChatRepository: Repository<Chat>,
    @InjectRepository(ChatMember) private readonly typeormChatMemberRepository: Repository<ChatMember>,
  ) {}

  public async addMember(member: ChatMember): Promise<void> {
    const isMemberAlreadyInChat = await this.checkIfMemberExistsByUserAndChatIds(member.userId, member.chatId);

    if (isMemberAlreadyInChat) {
      throw new Error('User is already in chat!');
    }

    await this.typeormChatMemberRepository.save(member);
  }

  public async addPrivateChat(chat: Chat): Promise<void> {
    const firstUserId = chat.members[0].userId;
    const secondUserId = chat.members[1]?.userId;

    let doesChatAlreadyExist: boolean;

    if (secondUserId) {
      doesChatAlreadyExist = await this.checkIfPrivateChatExistsByMemberIds(firstUserId, secondUserId);
    } else {
      doesChatAlreadyExist = await this.checkIfPrivateChatWithTheOnlyMemberExistsByUserId(firstUserId);
    }

    if (doesChatAlreadyExist) {
      throw new ChatAlreadyExistsException();
    }

    chat.type = ChatType.PRIVATE;

    await this.typeormChatRepository.save(chat);

    const savedChat = await this.findOneById(chat.id);

    Object.assign(chat, savedChat);
  }

  public async addGroupChat(chat: Chat): Promise<void> {
    chat.type = ChatType.GROUP;

    await this.typeormChatRepository.save(chat);

    const savedChat = await this.findOneById(chat.id);

    Object.assign(chat, savedChat);
  }

  public async findOneById(id: string): Promise<Chat> {
    return this.typeormChatRepository.findOne({
      where: { id },
      relations: {
        members: true,
      },
    });
  }

  public async findOneByIdOrThrow(id: string): Promise<Chat> {
    const chat = await this.findOneById(id);

    if (!chat) {
      throw new ChatNotExistException();
    }

    return chat;
  }

  public async findManyWithMemberByUserId(memberId: string, paginationOptions: PaginationOptions): Promise<Paginated<Chat>> {
    const queryBuilder = await this.typeormChatRepository.createQueryBuilder('c');

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

  public async deleteMemberByUserAndChatIdsOrThrow(memberId: string, chatId: string): Promise<ChatMember> {
    const doesChatExist = await this.checkIfChatExistsById(chatId);

    if (!doesChatExist) {
      throw new ChatNotExistException();
    }

    const member = await this.findMemberByUserAndChatIdsThrow(memberId, chatId);

    await this.typeormChatMemberRepository.delete({ userId: memberId, chatId });

    return member;
  }

  public async findMemberByUserAndChatIds(memberId: string, chatId: string): Promise<ChatMember> {
    return this.typeormChatMemberRepository.findOne({
      where: {
        userId: memberId,
        chatId,
      },
    });
  }

  public async findMemberByUserAndChatIdsThrow(memberId: string, chatId: string): Promise<ChatMember> {
    const member = await this.findMemberByUserAndChatIds(memberId, chatId);

    if (!member) {
      throw new ChatMemberNotExistException();
    }

    return member;
  }

  public async checkIfMemberExistsByUserAndChatIds(memberId: string, chatId: string): Promise<boolean> {
    const doesChatExist = await this.checkIfChatExistsById(chatId);

    if (!doesChatExist) {
      throw new ChatNotExistException();
    }

    return this.typeormChatMemberRepository
      .createQueryBuilder('cm')
      .where('cm.chatId = :chatId', { chatId })
      .andWhere('cm.userId = :memberId', { memberId })
      .getExists();
  }

  private async checkIfPrivateChatWithTheOnlyMemberExistsByUserId(memberId: string): Promise<boolean> {
    const queryBuilder = await this.typeormChatRepository.createQueryBuilder('c');

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
    const queryBuilder = await this.typeormChatRepository.createQueryBuilder('c');

    const subQueryForFirstChatMemberExistenceCheck = queryBuilder
      .subQuery()
      .from(ChatMember, 'cm1')
      .where('cm1.chatId = c.id')
      .andWhere('cm1.userId = :firstMemberId', { firstMemberId });

    const subQueryForSecondChatMemberExistenceCheck = queryBuilder
      .subQuery()
      .from(ChatMember, 'cm2')
      .where('cm2.chatId = c.id')
      .andWhere('cm2.userId = :secondMemberId', { secondMemberId });

    queryBuilder.where('c.type = :private', { private: ChatType.PRIVATE });

    queryBuilder.andWhereExists(subQueryForFirstChatMemberExistenceCheck);
    queryBuilder.andWhereExists(subQueryForSecondChatMemberExistenceCheck);

    return queryBuilder.getExists();
  }

  public async checkIfChatExistsById(id: string): Promise<boolean> {
    return this.typeormChatRepository.createQueryBuilder('c').where('c.id = :id', { id }).getExists();
  }

  public async checkIfChatIsGroupChatById(chatId: string): Promise<boolean> {
    return this.typeormChatRepository
      .createQueryBuilder('c')
      .where('c.id = :id', { id: chatId })
      .andWhere('c.type = :group', { group: ChatType.GROUP })
      .getExists();
  }
}
