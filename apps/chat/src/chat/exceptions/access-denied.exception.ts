export class AccessDeniedException extends Error {
  constructor(reason: string = null) {
    super(reason);
  }

  public static from<E extends Error>(e: E) {
    return new ConditionBuilder(e);
  }
}

class ConditionBuilder<E extends Error> {
  constructor(private readonly exception: E) {}

  public throwUnless(condition: boolean) {
    if (!condition) {
      throw new AccessDeniedException(this.exception.message);
    }
  }
}
