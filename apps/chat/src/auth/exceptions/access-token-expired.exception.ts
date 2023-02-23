export class AccessTokenExpiredException extends Error {
  constructor() {
    super('Access token expired!');
  }
}
