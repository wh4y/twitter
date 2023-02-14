export class TokenExpiredException extends Error {
  constructor() {
    super('Token expired!');
  }
}
