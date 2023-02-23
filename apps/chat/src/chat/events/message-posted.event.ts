import { Message } from '../entities/message.entity';

export const MESSAGE_POSTED_EVENT = 'MESSAGE_POSTED_EVENT';

export class MessagePostedEventPayload {
  constructor(public readonly message: Message) {}
}
