import { Undefinedable } from "#lib/generics/index.js";
import { SpawnOptionsWithoutStdio } from "child_process";

export type TCLIResult = {
  stdout: string;
  stderr: string;
  errorCode: number | NodeJS.Signals;
  error: Error | null;
  errorMessage: () => Undefinedable<string>;
  isSuccess: () => boolean;
  isFailure: () => boolean;
};

export type TSpawnAsyncFn = (
  command: string,
  args: string[],
  options?: SpawnOptionsWithoutStdio
) => Promise<TCLIResult>;
