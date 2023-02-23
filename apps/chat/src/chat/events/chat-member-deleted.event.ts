import { ChatMember } from '../entities/chat-member.entity';

export const CHAT_MEMBER_DELETED_EVENT = 'HAT_MEMBER_DELETED_EVENT';

export class ChatMemberDeletedEventPayload {
  constructor(public readonly member: ChatMember) {}
}
