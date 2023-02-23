import { Injectable } from '@nestjs/common';

import { ChatMemberDeletedEventPayload } from '../events/chat-member-deleted.event';
import { ChatClientService } from '../services/chat-client/chat-client.service';
import { ChatRoomService } from '../services/chat-room/chat-room.service';

@Injectable()
export class ChatMemberDeletedEventSubscriber {
  constructor(private readonly chatClientService: ChatClientService, private readonly chatRoomService: ChatRoomService) {}

  public async handleChatMemberDeleted({ member }: ChatMemberDeletedEventPayload): Promise<void> {
    const memberClients = await this.chatClientService.getClientsByUserId(member.userId);

    for (const client of memberClients) {
      await this.chatRoomService.leaveRoom(client, member.chatId);
    }
  }
}
