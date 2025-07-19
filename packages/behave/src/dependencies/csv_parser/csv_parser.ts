import { Result } from "@project-conqueror/lib/patterns";
import { CsvError, parse } from "csv-parse";
import { ICSVParser } from "../interfaces";

export class CSVParser implements ICSVParser {
  async parse(csv: string): Promise<Result<Record<string, string>[]>> {
    return new Promise((resolve, reject) => {
      parse(
        csv,
        { columns: true },
        (error: CsvError | undefined, data: unknown[]) => {
          if (error) {
            reject(Result.error(error));
          }
          resolve(Result.success(data as unknown as Record<string, string>[]));
        }
      );
    });
  }

  async unparse(
    data: Record<string, string>[],
    filepath?: string
  ): Promise<Result<string>> {
    throw new Error("Method not implemented.");
  }
}
