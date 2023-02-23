import { WebSocket } from 'ws';

import { ChatClient } from '../../entities/chat-client.entity';

export type ClientConnectionOptions = {
  client: ChatClient;
  socket: WebSocket;
};
