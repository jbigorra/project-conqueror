import { Undefinedable } from "#lib/generics/index.js";

export type TCLIResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  error: Error | null;
  errorMessage: () => Undefinedable<string>;
  isSuccess: () => boolean;
  isFailure: () => boolean;
};

export type TCLIExecutorArgs = {
  requiredArgs: string[];
  optionalArgs: string[];
  optionalBooleanArgs: string[];
};
