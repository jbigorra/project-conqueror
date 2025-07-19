export abstract class Result<T> {
  abstract isSuccess(): boolean;
  abstract isError(): boolean;
  abstract getValue(): T;
  abstract getError(): Error;

  static success<T>(value: T): Result<T> {
    return new Success(value);
  }

  static error<T>(error: Error): Result<T> {
    return new Failure(error);
  }

  flatMap<U>(fn: (value: T) => Result<U>): Result<U> {
    if (this.isError()) return Result.error(this.getError());
    return fn(this.getValue());
  }

  map<U>(fn: (value: T) => U): Result<U> {
    if (this.isError()) return Result.error(this.getError());
    return Result.success(fn(this.getValue()));
  }
}

class Success<T> extends Result<T> {
  constructor(private readonly value: T) {
    super();
  }

  isSuccess(): boolean {
    return true;
  }

  isError(): boolean {
    return false;
  }

  getValue(): T {
    return this.value;
  }

  getError(): Error {
    throw new Error("Success result has no error");
  }
}

class Failure<T> extends Result<T> {
  constructor(private readonly error: Error) {
    super();
  }

  isSuccess(): boolean {
    return false;
  }

  isError(): boolean {
    return true;
  }

  getValue(): T {
    throw new Error("Failure result has no value");
  }

  getError(): Error {
    return this.error;
  }
}
