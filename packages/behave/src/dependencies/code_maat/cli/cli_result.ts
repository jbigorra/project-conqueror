import { TCLIResult } from "#behave/dependencies/interfaces.js";
import { Voidable } from "#behave/types.js";

export class CLIResult implements TCLIResult {
  constructor(
    public readonly exitCode: number,
    public readonly stdout: string,
    public readonly stderr: string,
  ) {}

  errorMessage(): Voidable<string> {
    if (this.isSuccess()) return void 0;
    if (this.stderr.length > 0) return this.stderr;
    if (this.stdout.length > 0) return this.stdout;

    return `Command failed with exit code ${this.exitCode}`;
  }

  isSuccess(): boolean {
    return this.exitCode === 0;
  }

  isFailure(): boolean {
    return !this.isSuccess();
  }
}
