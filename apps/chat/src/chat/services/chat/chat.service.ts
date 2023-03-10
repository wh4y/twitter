import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Paginated, PaginationOptions } from 'common/pagination';

import { User } from '../../../user/entities/user.entity';
import { ChatMember } from '../../entities/chat-member.entity';
import { Chat } from '../../entities/chat.entity';
import { Message } from '../../entities/message.entity';
import { ChatMemberRole } from '../../enums/chat-member-role.enum';
import { CHAT_CREATED_EVENT, ChatCreatedEventPayload } from '../../events/chat-created.event';
import { CHAT_MEMBER_DELETED_EVENT, ChatMemberDeletedEventPayload } from '../../events/chat-member-deleted.event';
import { MESSAGE_POSTED_EVENT, MessagePostedEventPayload } from '../../events/message-posted.event';
import { AddingMemberNotInGroupChatException } from '../../exceptions/adding-member-not-in-group-chat.exception';
import { CurrentUserNotInChatException } from '../../exceptions/current-user-not-in-chat.exception';
import { ChatRepository } from '../../repositories/chat/chat.repository';
import { MessageRepository } from '../../repositories/message/message.repository';
import { ChatPermissionsService } from '../chat-permissions/chat-permissions.service';

import { CreateGroupChatOptions, CreatePrivateChatOptions, MessageContent } from './chat-service.options';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly messageRepository: MessageRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly chatPermissionsService: ChatPermissionsService,
  ) {}

  public async getUserChats(userId: string, paginationOptions: PaginationOptions): Promise<Paginated<Chat>> {
    return this.chatRepository.findManyWithMemberByUserId(userId, paginationOptions);
  }

  public async createPrivateChat({ currentUser, interlocutor }: CreatePrivateChatOptions): Promise<Chat> {
    const areCurrentUserAndInterlocutorTheSameUser = currentUser.id === interlocutor.id;

    if (!areCurrentUserAndInterlocutorTheSameUser) {
      await this.chatPermissionsService.currentUserCanCreatePrivateChatWithInterlocutorOrThrow(currentUser, interlocutor);
    }

    const chat = new Chat({ members: [] });

    chat.members.push(new ChatMember({ userId: currentUser.id }));

    if (!areCurrentUserAndInterlocutorTheSameUser) {
      chat.members.push(new ChatMember({ userId: interlocutor.id }));
    }

    await this.chatRepository.addPrivateChat(chat);

    this.eventEmitter.emit(CHAT_CREATED_EVENT, new ChatCreatedEventPayload(chat));

    return chat;
  }

  public async createGroupChat({ founder, invitedUsers }: CreateGroupChatOptions): Promise<Chat> {
    const chat = new Chat({ members: [] });

    const invitedMembers = invitedUsers.map((user) => new ChatMember({ userId: user.id }));
    const chatFounder = new ChatMember({ userId: founder.id, role: ChatMemberRole.ADMIN });

    chat.members.push(chatFounder, ...invitedMembers);

    await this.chatRepository.addGroupChat(chat);

    this.eventEmitter.emit(CHAT_CREATED_EVENT, new ChatCreatedEventPayload(chat));

    return chat;
  }

  public async addMemberToGroupChat(chatId: string, userId: string, currentUser: User): Promise<void> {
    await this.chatPermissionsService.currentUserCanAddMembersToChatOrThrow(currentUser, chatId);

    const isChatGroupChat = await this.chatRepository.checkIfChatIsGroupChatById(chatId);

    if (!isChatGroupChat) {
      throw new AddingMemberNotInGroupChatException();
    }

    const member = new ChatMember({ userId, chatId });

    await this.chatRepository.addMember(member);
  }

  public async removeMemberFromGroupChat(chatId: string, memberId: string, currentUser: User): Promise<void> {
    await this.chatPermissionsService.currentUserCanRemoveMembersFormGroupChatOrThrow(currentUser, chatId);

    const member = await this.chatRepository.deleteMemberByUserAndChatIdsOrThrow(memberId, chatId);

    this.eventEmitter.emit(CHAT_MEMBER_DELETED_EVENT, new ChatMemberDeletedEventPayload(member));
  }

  public async postMessage(chatId: string, content: MessageContent, currentUser: User): Promise<Message> {
    await this.chatPermissionsService.currentUserCanPostMessagesInChatOrThrow(currentUser, chatId);

    const message = new Message({ chatId, ...content, authorId: currentUser.id });

    await this.messageRepository.save(message);

    this.eventEmitter.emit(MESSAGE_POSTED_EVENT, new MessagePostedEventPayload(message));

    return message;
  }

  public async leaveGroupChat(chatId: string, currentUser: User): Promise<void> {
    const isCurrentUserInChat = await this.chatRepository.checkIfMemberExistsByUserAndChatIds(currentUser.id, chatId);

    if (isCurrentUserInChat) {
      throw new CurrentUserNotInChatException();
    }

    const member = await this.chatRepository.deleteMemberByUserAndChatIdsOrThrow(currentUser.id, chatId);

    this.eventEmitter.emit(CHAT_MEMBER_DELETED_EVENT, new ChatMemberDeletedEventPayload(member));
  }

  public async getChatMessages(chatId: string, paginationOptions: PaginationOptions, currentUser: User): Promise<Paginated<Message>> {
    await this.chatPermissionsService.currentUserCanViewChatOrThrow(currentUser, chatId);

    const member = await this.chatRepository.findMemberByUserAndChatIds(currentUser.id, chatId);

    return this.messageRepository.findManyByChatId(chatId, paginationOptions, { createdLaterThan: member.createdAt });
  }
}
