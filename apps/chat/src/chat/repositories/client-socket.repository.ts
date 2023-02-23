import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';

@Injectable()
export class ClientSocketRepository {
  private readonly connectedSockets = new Map<string, WebSocket>();

  public add(clientId: string, socket: WebSocket): void {
    this.connectedSockets.set(clientId, socket);
  }

  public findOneByClientId(clientId: string): WebSocket {
    return this.connectedSockets.get(clientId);
  }

  public deleteByClientId(clientId: string): void {
    this.connectedSockets.delete(clientId);
  }
}
