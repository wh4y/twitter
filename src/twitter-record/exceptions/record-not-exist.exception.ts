export class RecordNotExistException extends Error {
  constructor() {
    super("Record doesn't exist!");
  }
}
