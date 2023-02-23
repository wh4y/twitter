export class ChatNotExistException extends Error {
  constructor() {
    super("Chat doesn't exist!");
  }
}
