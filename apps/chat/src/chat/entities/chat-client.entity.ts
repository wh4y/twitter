export class ChatClient {
  id: string;
  userId: string;

  constructor(partialEntity: Partial<ChatClient>) {
    Object.assign(this, partialEntity);
  }
}
