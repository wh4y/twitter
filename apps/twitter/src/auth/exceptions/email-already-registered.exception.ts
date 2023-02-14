export class EmailAlreadyRegisteredException extends Error {
  constructor() {
    super('Email already registered!');
  }
}
