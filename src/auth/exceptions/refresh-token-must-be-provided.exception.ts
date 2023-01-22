export class RefreshTokenMustBeProvidedException extends Error {
  constructor() {
    super('Refresh token must be provided!');
  }
}
