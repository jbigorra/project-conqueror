import { describe, expect, it } from "bun:test";
import path from "node:path";
import { LizardInstance } from "#lizard/index.ts";

const REPO_ROOT = path.resolve(import.meta.dir, "../../../../");
const EXPECTED_OUTPUT =
  "nloc,cyclomatic_complexity,token_count,parameters,length,location,file,function,long_name,start_line,end_line\n" +
  '5,1,43,1,5,"constructor@12-16@/Users/jbigorra/Projects/project-conqueror/packages/lizard-ts/tests/ts-lizard/sample-folder-for-integration-test/sample-file-for-integration-test.ts","/Users/jbigorra/Projects/project-conqueror/packages/lizard-ts/tests/ts-lizard/sample-folder-for-integration-test/sample-file-for-integration-test.ts","constructor","constructor ( args : { name : string ; sellIn : number ; quality : number } )",12,16\n' +
  '3,1,18,1,3,"constructor@22-24@/Users/jbigorra/Projects/project-conqueror/packages/lizard-ts/tests/ts-lizard/sample-folder-for-integration-test/sample-file-for-integration-test.ts","/Users/jbigorra/Projects/project-conqueror/packages/lizard-ts/tests/ts-lizard/sample-folder-for-integration-test/sample-file-for-integration-test.ts","constructor","constructor ( items : Item [ ] = [ ] )",22,24\n' +
  '56,19,460,0,57,"updateQuality@26-82@/Users/jbigorra/Projects/project-conqueror/packages/lizard-ts/tests/ts-lizard/sample-folder-for-integration-test/sample-file-for-integration-test.ts","/Users/jbigorra/Projects/project-conqueror/packages/lizard-ts/tests/ts-lizard/sample-folder-for-integration-test/sample-file-for-integration-test.ts","updateQuality","updateQuality ( )",26,82\n';

describe("Lizard integration", () => {
  const lizard = LizardInstance.create();

  it("should analyze a single TypeScript file and return lizard output", async () => {
    const targetFile = path.resolve(
      REPO_ROOT,
      "packages/lizard-ts/tests/ts-lizard/sample-folder-for-integration-test/sample-file-for-integration-test.ts",
    );

    const result = await lizard.analyze(targetFile);

    expect(result).not.toBeInstanceOf(Error);
    expect(result).toContain(EXPECTED_OUTPUT);
  });

  it("should analyze a directory and return results for multiple files", async () => {
    const targetDir = path.resolve(
      REPO_ROOT,
      "packages/lizard-ts/tests/ts-lizard/sample-folder-for-integration-test",
    );

    const result = await lizard.analyze(targetDir);

    expect(result).not.toBeInstanceOf(Error);
    expect(result).toBe(EXPECTED_OUTPUT);
  });

  it("should return an error for a nonexistent path", async () => {
    const result = await lizard.analyze("/nonexistent/path/to/code");

    expect(result).not.toBeInstanceOf(Error);
    const output = result as string;
    console.log(output);
    expect(output).toBe(lizard.CSV_HEADERS);
  });
});
