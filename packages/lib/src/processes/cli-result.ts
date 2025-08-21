import { Undefinedable } from "#lib/generics/index.js";
import { TCLIResult } from "./types.js";

export class CLIResult implements TCLIResult {
  constructor(
    public readonly errorCode: number | NodeJS.Signals,
    public readonly stdout: string,
    public readonly stderr: string,
    public readonly error: Error | null = null,
  ) {
    if (errorCode === null) {
      throw new Error("errorCode is can't be null");
    }
  }

  errorMessage(): Undefinedable<string> {
    if (this.isSuccess()) return undefined;
    if (this.error) return this.error.message;
    if (this.stderr.trim().length > 0) return this.stderr;
    if (this.stdout.trim().length > 0) return this.stdout;

    return `Command failed with errorCode ${this.errorCode}`;
  }

  isSuccess(): boolean {
    return this.errorCode === 0;
  }

  isFailure(): boolean {
    return !this.isSuccess();
  }
}
