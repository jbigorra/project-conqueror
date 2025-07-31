import { Result } from "@prj-conq/lib/patterns";
import { TCLIResult } from "@prj-conq/lib/processes";

export interface ICLIExecutor {
  execute(args: string[]): Promise<Result<TCLIResult>>;
}

export interface ICSVParser {
  parse(csv: string): Promise<Result<Record<string, string>[]>>;
  unparse(
    data: Record<string, string>[],
    filepath?: string
  ): Promise<Result<string>>;
}
