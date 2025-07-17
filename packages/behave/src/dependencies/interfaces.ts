export type CLIResult = {
  stdout: string;
  stderr: string;
  exit_code: number;
  error_message: () => string;
  is_success: () => boolean;
  is_failure: () => boolean;
};

export type CLIExecutorArgs = {
  required_args: string[];
  optional_args: string[];
  optional_boolean_args: string[];
};

export interface ICLIExecutor {
  execute(args: CLIExecutorArgs): Promise<CLIResult>;
}
