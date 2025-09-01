import type { SpawnOptionsWithoutStdio } from "child_process";
import type { Undefinedable } from "../generics";

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
  options?: SpawnOptionsWithoutStdio,
) => Promise<TCLIResult>;
