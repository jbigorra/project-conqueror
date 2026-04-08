/**
 * Railway-oriented error handling monad with Success and Failure branches.
 *
 * @example
 * ```ts
 * import { Result } from "@prj-conq/lib/patterns";
 *
 * const result = Result.success({ id: "1", name: "analysis.log" });
 * const mapped = result.map(file => file.name);
 *
 * if (mapped.isSuccess()) {
 *   console.log(mapped.getValue()); // "analysis.log"
 * }
 * ```
 */
export abstract class Result<T> {
  /** @returns true if this result contains a success value */
  abstract isSuccess(): boolean;

  /** @returns true if this result contains an error */
  abstract isError(): boolean;

  /**
   * Unwraps the success value.
   *
   * @returns The contained success value
   * @throws {Error} If called on a Failure result
   */
  abstract getValue(): T;

  /**
   * Unwraps the error.
   *
   * @returns The contained error
   * @throws {Error} If called on a Success result
   */
  abstract getError(): Error;

  /**
   * Creates a successful Result containing the given value.
   *
   * @param value - The success value to wrap
   * @returns A Success result containing the value
   *
   * @example
   * ```ts
   * const result = Result.success({ id: "1", name: "report" });
   * result.isSuccess(); // true
   * ```
   */
  static success<T>(value: T): Result<T> {
    return new Success(value);
  }

  /**
   * Creates a failed Result containing the given error.
   *
   * @param error - The error to wrap
   * @returns A Failure result containing the error
   *
   * @example
   * ```ts
   * const result = Result.error<string>(new Error("File not found"));
   * result.isError(); // true
   * ```
   */
  static error<T>(error: Error): Result<T> {
    return new Failure(error);
  }

  /**
   * Chains an operation that returns a Result, short-circuiting on error.
   *
   * @param fn - Function that receives the success value and returns a new Result
   * @returns The result of fn if this is Success, or the original error if this is Failure
   *
   * @example
   * ```ts
   * const result = Result.success("analysis.log")
   *   .flatMap(name => validateFilename(name))
   *   .flatMap(name => saveFile(name));
   * ```
   */
  flatMap<U>(fn: (value: T) => Result<U>): Result<U> {
    if (this.isError()) return Result.error(this.getError());
    return fn(this.getValue());
  }

  /**
   * Transforms the success value, short-circuiting on error.
   *
   * @param fn - Function that transforms the success value
   * @returns A new Result with the transformed value, or the original error
   *
   * @example
   * ```ts
   * const result = Result.success(42).map(n => n * 2);
   * result.getValue(); // 84
   * ```
   */
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
