import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SchedulerModule } from 'common/scheduler';

import { AuthModule } from '../auth/auth.module';
import { UserFollowingsExternalModule } from '../external/user-followings/user-followings.external-module';

import { ChatController } from './controllers/chat.controller';
import { ChatMember } from './entities/chat-member.entity';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { ChatCreatedEventSubscriber } from './event-subscribers/chat-created.event-subscriber';
import { ChatMemberDeletedEventSubscriber } from './event-subscribers/chat-member-deleted.event-subscriber';
import { WsChatGateway } from './gateways/ws-chat.gateway';
import { ChatClientRepository } from './repositories/chat-client.repository';
import { ChatRoomRepository } from './repositories/chat-room.repository';
import { ChatRepository } from './repositories/chat.repository';
import { ClientSocketRepository } from './repositories/client-socket.repository';
import { MessageRepository } from './repositories/message.repository';
import { ChatClientService } from './services/chat-client/chat-client.service';
import { ChatPermissionsService } from './services/chat-permissions/chat-permissions.service';
import { ChatRoomService } from './services/chat-room/chat-room.service';
import { ChatService } from './services/chat/chat.service';
import { ClientConnectionService } from './services/client-connection/client-connection.service';

@Module({
  controllers: [ChatController],
  imports: [TypeOrmModule.forFeature([Chat, Message, ChatMember]), AuthModule, SchedulerModule, UserFollowingsExternalModule],
  providers: [
    ChatService,
    ChatRepository,
    MessageRepository,
    WsChatGateway,
    ChatRoomRepository,
    ChatRoomService,
    ChatClientRepository,
    ChatClientService,
    ClientSocketRepository,
    ClientSocketRepository,
    ClientConnectionService,
    ChatCreatedEventSubscriber,
    ChatPermissionsService,
    ChatMemberDeletedEventSubscriber,
  ],
})
export class ChatModule {}
