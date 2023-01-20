export class SessionNotExistException extends Error {
  constructor() {
    super("Session doesn't exist!");
  }
}
