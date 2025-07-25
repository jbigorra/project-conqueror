import { Voidable } from "#behave/types.js";
import { Result } from "@prj-conq/lib/patterns";

export type TCLIResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  errorMessage: () => Voidable<string>;
  isSuccess: () => boolean;
  isFailure: () => boolean;
};

export type TCLIExecutorArgs = {
  requiredArgs: string[];
  optionalArgs: string[];
  optionalBooleanArgs: string[];
};

export interface ICLIExecutor {
  execute(args: TCLIExecutorArgs): Promise<Result<TCLIResult>>;
}

export interface ICSVParser {
  parse(csv: string): Promise<Result<Record<string, string>[]>>;
  unparse(
    data: Record<string, string>[],
    filepath?: string
  ): Promise<Result<string>>;
}
