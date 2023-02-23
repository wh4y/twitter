import { OnEvent } from '@nestjs/event-emitter';
import { ConnectedSocket, OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';

import { WsAuthService } from '../../auth/services/ws-auth.service';
import { ChatClient } from '../entities/chat-client.entity';
import { MESSAGE_POSTED_EVENT, MessagePostedEventPayload } from '../events/message-posted.event';
import { ChatRoomService } from '../services/chat-room/chat-room.service';
import { ClientConnectionService } from '../services/client-connection/client-connection.service';

@WebSocketGateway(81)
export class WsChatGateway implements OnGatewayConnection {
  constructor(
    private readonly wsAuthService: WsAuthService,
    private readonly chatRoomService: ChatRoomService,
    private readonly clientConnectionService: ClientConnectionService,
  ) {}

  public async handleConnection(@ConnectedSocket() socket: WebSocket, handshake: IncomingMessage): Promise<void> {
    const { id: clientId, userId } = await this.wsAuthService.authenticateSession(handshake);

    const client = new ChatClient({ id: clientId, userId });

    await this.clientConnectionService.handleClientConnection({ client, socket });
  }

  @OnEvent(MESSAGE_POSTED_EVENT)
  public async handleMessagePosted({ message }: MessagePostedEventPayload): Promise<void> {
    const { clientIds } = await this.chatRoomService.getRoomByChatId(message.chatId);

    for (const clientId of clientIds) {
      const socket = this.clientConnectionService.getClientSocketByClientId(clientId);

      await socket.send(JSON.stringify(message));
    }
  }
}
