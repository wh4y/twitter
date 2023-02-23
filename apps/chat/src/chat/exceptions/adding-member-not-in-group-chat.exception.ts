export class AddingMemberNotInGroupChatException extends Error {
  constructor() {
    super('Adding members is only allowed in group chats!');
  }
}
