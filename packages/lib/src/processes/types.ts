import { Undefinedable } from "#lib/generics/index.js";

export type TCLIResult = {
  stdout: string;
  stderr: string;
  errorCode: number | NodeJS.Signals;
  error: Error | null;
  errorMessage: () => Undefinedable<string>;
  isSuccess: () => boolean;
  isFailure: () => boolean;
};
