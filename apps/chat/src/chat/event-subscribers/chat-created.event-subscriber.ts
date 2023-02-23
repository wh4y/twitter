import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { CHAT_CREATED_EVENT, ChatCreatedEventPayload } from '../events/chat-created.event';
import { ChatClientService } from '../services/chat-client/chat-client.service';
import { ChatRoomService } from '../services/chat-room/chat-room.service';

@Injectable()
export class ChatCreatedEventSubscriber {
  constructor(private readonly chatClientService: ChatClientService, private readonly chatRoomService: ChatRoomService) {}

  @OnEvent(CHAT_CREATED_EVENT)
  public async handleChatCreated({ chat }: ChatCreatedEventPayload): Promise<void> {
    const memberIds = chat.members.map((member) => member.userId);
    const membersClients = await this.chatClientService.getManyClientsByUserIds(memberIds);

    for (const client of membersClients) {
      await this.chatRoomService.joinChatRoom(chat.id, client);
    }
  }
}
