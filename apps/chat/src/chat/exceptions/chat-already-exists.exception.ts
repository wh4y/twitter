export class ChatAlreadyExistsException extends Error {
  constructor() {
    super('Chat already exists!');
  }
}
