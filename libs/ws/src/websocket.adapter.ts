import { INestApplicationContext, WebSocketAdapter } from '@nestjs/common';
import { MessageMappingProperties } from '@nestjs/websockets';
import { EMPTY, filter, fromEvent, mergeMap, Observable } from 'rxjs';
import { Server, WebSocket } from 'ws';

export class WebsocketAdapter implements WebSocketAdapter {
  constructor(private app: INestApplicationContext) {}

  create(port: number, options: any = {}): Server {
    return new WebSocket.Server({
      port,
      ...options,
    });
  }

  bindClientConnect(server: Server, callback: any) {
    server.on('connection', callback);
  }

  bindClientDisconnect(client: WebSocket, callback: any): any {
    client.on('close', callback);
  }

  bindMessageHandlers(client: WebSocket, handlers: MessageMappingProperties[], process: (data: any) => Observable<any>) {
    fromEvent(client, 'message')
      .pipe(
        mergeMap((data) => this.bindMessageHandler(data, handlers, process)),
        filter((result) => result),
      )
      .subscribe((response) => client.send(JSON.stringify(response)));
  }

  bindMessageHandler(buffer, handlers: MessageMappingProperties[], process: (data: any) => Observable<any>): Observable<any> {
    const message = JSON.parse(buffer.data);
    const messageHandler = handlers.find((handler) => handler.message === message.event);

    if (!messageHandler) {
      return EMPTY;
    }

    return process(messageHandler.callback(message.data));
  }

  close(server) {
    server.close();
  }
}
