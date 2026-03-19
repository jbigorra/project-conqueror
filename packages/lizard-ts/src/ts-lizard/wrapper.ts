import type { ICLIExecutor } from "#lizard/ts-lizard/infrastructure/interfaces.ts";

export class Lizard {
  readonly CSV_HEADERS =
    "nloc,cyclomatic_complexity,token_count,parameters,length,location,file,function,long_name,start_line,end_line\n";
  constructor(private readonly executor: ICLIExecutor) {}

  async analyze(sourcePath: string): Promise<string | Error> {
    const result = await this.executor.execute([sourcePath, "--csv"]);

    if (result.isError()) {
      return result.getError();
    }

    return this.CSV_HEADERS + result.getValue().stdout;
  }
}
