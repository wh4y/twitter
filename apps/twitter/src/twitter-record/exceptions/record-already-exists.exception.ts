export class RecordAlreadyExistsException extends Error {
  constructor() {
    super('Record already exists!');
  }
}
