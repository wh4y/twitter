export class RefreshTokenNotExistException extends Error {
  constructor() {
    super("Refresh token doesn't exist!");
  }
}
