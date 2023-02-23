export class ChatMemberNotExistException extends Error {
  constructor() {
    super("Chat member doesn't exist!");
  }
}
