import type { Result } from "@prj-conq/lib/patterns";
import type { TCLIResult } from "@prj-conq/lib/processes";

export interface ICLIExecutor {
	execute(args: string[]): Promise<Result<TCLIResult>>;
}
