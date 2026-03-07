import { describe, test, expect } from "bun:test";
import { parseReadLog } from "../../../src/code_maat/parsers/git2";

const entry = "--990442e--2013-08-29--Adam Petersen\n1\t0\tproject.clj\n2\t4\tsrc/code_maat/parsers/git.clj\n";

const binaryEntry = "--990442e--2013-11-10--Adam Petersen\n-\t-\tproject.bin\n2\t40\tsrc/code_maat/parsers/git.clj\n";

const entries =
  "--b777738--2013-08-29--Adam Petersen\n10\t9\tsrc/code_maat/parsers/git.clj\n32\t0\ttest/code_maat/parsers/git_test.clj\n\n" +
  "--a527b79--2013-08-29--Adam Petersen\n6\t2\tsrc/code_maat/parsers/git.clj\n0\t7\ttest/code_maat/end_to_end/scenario_tests.clj\n18\t0\ttest/code_maat/end_to_end/simple_git.txt\n21\t0\ttest/code_maat/end_to_end/svn_live_data_test.clj\n";

const pullRequests =
  "--0d3de0c--2013-01-04--Mr X\n--77c8751--2013-01-04--Mr Y\n1\t1\tbuild.xml\n1\t1\tproject/Versions.scala\n";

describe("git2 parser", () => {
  test("parses single entry to dataset", () => {
    expect(parseReadLog(entry, {})).toEqual([
      { locDeleted: "0", locAdded: "1", author: "Adam Petersen", rev: "990442e", date: "2013-08-29", entity: "project.clj", message: "-" },
      { locDeleted: "4", locAdded: "2", author: "Adam Petersen", rev: "990442e", date: "2013-08-29", entity: "src/code_maat/parsers/git.clj", message: "-" },
    ]);
  });

  test("parses entry with binary to dataset (churn shown as dash)", () => {
    expect(parseReadLog(binaryEntry, {})).toEqual([
      { locDeleted: "-", locAdded: "-", author: "Adam Petersen", rev: "990442e", date: "2013-11-10", entity: "project.bin", message: "-" },
      { locDeleted: "40", locAdded: "2", author: "Adam Petersen", rev: "990442e", date: "2013-11-10", entity: "src/code_maat/parsers/git.clj", message: "-" },
    ]);
  });

  test("parses multiple entries to dataset", () => {
    expect(parseReadLog(entries, {})).toEqual([
      { locDeleted: "9", locAdded: "10", author: "Adam Petersen", rev: "b777738", date: "2013-08-29", entity: "src/code_maat/parsers/git.clj", message: "-" },
      { locDeleted: "0", locAdded: "32", author: "Adam Petersen", rev: "b777738", date: "2013-08-29", entity: "test/code_maat/parsers/git_test.clj", message: "-" },
      { locDeleted: "2", locAdded: "6", author: "Adam Petersen", rev: "a527b79", date: "2013-08-29", entity: "src/code_maat/parsers/git.clj", message: "-" },
      { locDeleted: "7", locAdded: "0", author: "Adam Petersen", rev: "a527b79", date: "2013-08-29", entity: "test/code_maat/end_to_end/scenario_tests.clj", message: "-" },
      { locDeleted: "0", locAdded: "18", author: "Adam Petersen", rev: "a527b79", date: "2013-08-29", entity: "test/code_maat/end_to_end/simple_git.txt", message: "-" },
      { locDeleted: "0", locAdded: "21", author: "Adam Petersen", rev: "a527b79", date: "2013-08-29", entity: "test/code_maat/end_to_end/svn_live_data_test.clj", message: "-" },
    ]);
  });

  test("parses empty log to empty dataset", () => {
    expect(parseReadLog("", {})).toEqual([]);
  });

  test("parses pull requests (regression: skips commits with no file changes, uses last commit header)", () => {
    expect(parseReadLog(pullRequests, {})).toEqual([
      { locDeleted: "1", locAdded: "1", author: "Mr Y", rev: "77c8751", date: "2013-01-04", entity: "build.xml", message: "-" },
      { locDeleted: "1", locAdded: "1", author: "Mr Y", rev: "77c8751", date: "2013-01-04", entity: "project/Versions.scala", message: "-" },
    ]);
  });
});
