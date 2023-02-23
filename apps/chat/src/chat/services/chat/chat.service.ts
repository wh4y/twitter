import { ForbiddenError } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Paginated, PaginationOptions } from 'common/pagination';

import { User } from '../../../user/entities/user.entity';
import { ChatMember } from '../../entities/chat-member.entity';
import { Chat } from '../../entities/chat.entity';
import { Message } from '../../entities/message.entity';
import { ChatAbility } from '../../enums/chat-ability.enum';
import { CHAT_CREATED_EVENT, ChatCreatedEventPayload } from '../../events/chat-created.event';
import { MESSAGE_POSTED_EVENT, MessagePostedEventPayload } from '../../events/message-posted.event';
import { ChatRepository } from '../../repositories/chat.repository';
import { MessageRepository } from '../../repositories/message.repository';
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
    return this.chatRepository.findManyWithMember(userId, paginationOptions);
  }

  public async createPrivateChat({ currentUser, interlocutor }: CreatePrivateChatOptions): Promise<Chat> {
    const areCurrentUserAndInterlocutorTheSameUser = currentUser.id === interlocutor.id;

    if (!areCurrentUserAndInterlocutorTheSameUser) {
      await this.chatPermissionsService.currentUserCanCreateChatWithInterlocutorOrThrow(currentUser, interlocutor);
    }

    const chat = new Chat({ members: [] });

    chat.members.push(ChatMember.from(currentUser));

    if (!areCurrentUserAndInterlocutorTheSameUser) {
      chat.members.push(ChatMember.from(interlocutor));
    }

    await this.chatRepository.addPrivateChat(chat);

    this.eventEmitter.emit(CHAT_CREATED_EVENT, new ChatCreatedEventPayload(chat));

    return chat;
  }

  public async createGroupChat({ currentUser, invitedUsers }: CreateGroupChatOptions): Promise<Chat> {
    const members = [ChatMember.from(currentUser), ...invitedUsers.map((user) => ChatMember.from(user))];

    const chat = new Chat({ members });

    await this.chatRepository.addGroupChat(chat);

    this.eventEmitter.emit(CHAT_CREATED_EVENT, new ChatCreatedEventPayload(chat));

    return chat;
  }

  public async postMessage(chatId: string, content: MessageContent, currentUser: User): Promise<Message> {
    const chat = await this.chatRepository.findByIdOrThrow(chatId);

    const abilityToPostMessages = await this.chatPermissionsService.defineAbilitiesFor(currentUser);

    ForbiddenError.from(abilityToPostMessages)
      .setMessage('User is not member of given chat')
      .throwUnlessCan(ChatAbility.POST_MESSAGES_IN, chat);

    const message = new Message({ chatId, ...content, authorId: currentUser.id });

    await this.messageRepository.save(message);

    this.eventEmitter.emit(MESSAGE_POSTED_EVENT, new MessagePostedEventPayload(message));

    return message;
  }

  public async getChatMessages(chatId: string, paginationOptions: PaginationOptions, currentUser: User): Promise<Paginated<Message>> {
    const chat = await this.chatRepository.findOneById(chatId);

    const abilityToViewChatMessages = await this.chatPermissionsService.defineAbilitiesFor(currentUser);

    ForbiddenError.from(abilityToViewChatMessages)
      .setMessage('User is not member of given chat')
      .throwUnlessCan(ChatAbility.VIEW, chat);

    return this.messageRepository.findManyByChatId(chatId, paginationOptions);
  }
}
