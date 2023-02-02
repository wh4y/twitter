export class UnexpectedRecordAuthorException extends Error {
  constructor() {
    super('Unexpected record author given!');
  }
}
