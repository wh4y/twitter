import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';

import { SchedulerService } from 'common/scheduler';

import { CLIENT_CONNECTION_TTL } from '../../constants/client-connection-ttl.constant';
import { ChatClient } from '../../entities/chat-client.entity';
import { ClientSocketRepository } from '../../repositories/client-socket.repository';
import { ChatClientService } from '../chat-client/chat-client.service';
import { ChatRoomService } from '../chat-room/chat-room.service';

import { ClientConnectionOptions } from './client-connection-service.options';

@Injectable()
export class ClientConnectionService {
  constructor(
    private readonly chatClientService: ChatClientService,
    private readonly chatRoomService: ChatRoomService,
    private readonly clientSocketRepository: ClientSocketRepository,
    private readonly scheduler: SchedulerService,
  ) {}

  private getClientConnectionClosureTimeoutName(client: ChatClient): string {
    return `CHAT_CLIENT_${client.id}_CONNECTION_CLOSURE_TIMEOUT`;
  }

  private scheduleClientConnectionClosure(client: ChatClient): void {
    const socket = this.clientSocketRepository.findOneByClientId(client.id);
    const timeoutName = this.getClientConnectionClosureTimeoutName(client);

    const closeConnection = async () => {
      socket.close(3001, 'Connection time expired!');
    };

    this.scheduler.addTimeout(timeoutName, CLIENT_CONNECTION_TTL, closeConnection);
  }

  private cancelScheduledClientConnectionClosure(client: ChatClient): void {
    const timeoutName = this.getClientConnectionClosureTimeoutName(client);

    const doesTimeoutExist = this.scheduler.doesTimeoutExist(timeoutName);

    if (!doesTimeoutExist) {
      return;
    }

    this.scheduler.deleteTimeout(timeoutName);
  }

  private defineClientSocketOnCloseBehavior(client: ChatClient, socket: WebSocket): void {
    socket.on('close', async () => {
      await this.chatRoomService.leaveAllClientChatRooms(client);
      await this.chatClientService.removeClient(client);
      this.clientSocketRepository.deleteByClientId(client.id);

      this.cancelScheduledClientConnectionClosure(client);
    });
  }

  public async handleClientConnection({ client, socket }: ClientConnectionOptions): Promise<void> {
    await this.chatClientService.registerClient(client);
    await this.chatRoomService.joinAllClientChatRooms(client);

    this.defineClientSocketOnCloseBehavior(client, socket);

    await this.clientSocketRepository.add(client.id, socket);

    this.scheduleClientConnectionClosure(client);
  }

  public getClientSocketByClientId(clientId: string): WebSocket {
    return this.clientSocketRepository.findOneByClientId(clientId);
  }
}
