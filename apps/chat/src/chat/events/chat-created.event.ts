import { Chat } from '../entities/chat.entity';

export const CHAT_CREATED_EVENT = 'CHAT_CREATED_EVENT';

export class ChatCreatedEventPayload {
  constructor(public readonly chat: Chat) {}
}
