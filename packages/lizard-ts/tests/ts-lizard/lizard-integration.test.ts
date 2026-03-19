import { describe, expect, it } from "bun:test";
import path from "node:path";
import { LizardInstance } from "#lizard/index.ts";

const REPO_ROOT = path.resolve(import.meta.dir, "../../../../");
const SAMPLE_RELATIVE_PATH =
  "packages/lizard-ts/tests/ts-lizard/sample-folder-for-integration-test/sample-file-for-integration-test.ts";

function buildExpectedOutput(absoluteFilePath: string): string {
  const headers =
    "nloc,cyclomatic_complexity,token_count,parameters,length,location,file,function,long_name,start_line,end_line\n";
  return (
    headers +
    `5,1,43,1,5,"constructor@12-16@${absoluteFilePath}","${absoluteFilePath}","constructor","constructor ( args : { name : string ; sellIn : number ; quality : number } )",12,16\n` +
    `3,1,18,1,3,"constructor@22-24@${absoluteFilePath}","${absoluteFilePath}","constructor","constructor ( items : Item [ ] = [ ] )",22,24\n` +
    `56,19,460,0,57,"updateQuality@26-82@${absoluteFilePath}","${absoluteFilePath}","updateQuality","updateQuality ( )",26,82\n`
  );
}

describe("Lizard integration", () => {
  const lizard = LizardInstance.create();

  it("should analyze a single TypeScript file and return lizard output", async () => {
    const targetFile = path.resolve(REPO_ROOT, SAMPLE_RELATIVE_PATH);

    const result = await lizard.analyze(targetFile);

    expect(result).not.toBeInstanceOf(Error);
    expect(result).toContain(buildExpectedOutput(targetFile));
  });

  it("should analyze a directory and return results for multiple files", async () => {
    const targetDir = path.resolve(
      REPO_ROOT,
      "packages/lizard-ts/tests/ts-lizard/sample-folder-for-integration-test",
    );
    const expectedFile = path.resolve(REPO_ROOT, SAMPLE_RELATIVE_PATH);

    const result = await lizard.analyze(targetDir);

    expect(result).not.toBeInstanceOf(Error);
    expect(result).toBe(buildExpectedOutput(expectedFile));
  });

  // Lizard exits with code 0 for nonexistent paths (reports 0 files analyzed).
  // The error path (non-zero exit) is covered by unit tests in wrapper.test.ts
  // and lizard-executor.test.ts.
  it("should return only headers for a nonexistent path", async () => {
    const result = await lizard.analyze("/nonexistent/path/to/code");

    expect(result).not.toBeInstanceOf(Error);
    const output = result as string;
    expect(output).toBe(lizard.CSV_HEADERS);
  });
});
