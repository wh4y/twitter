export class ChatRoom {
  chatId: string;
  clientIds: string[];

  constructor(partialEntity: Partial<ChatRoom>) {
    Object.assign(this, partialEntity);
  }
}
