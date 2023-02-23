export class CurrentUserNotInChatException extends Error {
  constructor() {
    super('Current user is not in chat!');
  }
}
