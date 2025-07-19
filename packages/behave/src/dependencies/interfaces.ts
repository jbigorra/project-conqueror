import { Result } from "@project-conqueror/lib/patterns";

export type TCLIResult = {
  stdout: string;
  stderr: string;
  exit_code: number;
  errorMessage: () => string;
  isSuccess: () => boolean;
  isFailure: () => boolean;
};

export type TCLIExecutorArgs = {
  required_args: string[];
  optional_args: string[];
  optional_boolean_args: string[];
};

export interface ICLIExecutor {
  execute(args: TCLIExecutorArgs): Promise<TCLIResult>;
}

export interface ICSVParser {
  parse(csv: string): Promise<Result<Record<string, string>>>;
  unparse(
    data: Record<string, string>,
    filepath?: string
  ): Promise<Result<string>>;
}
