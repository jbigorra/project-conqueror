import { describe, test, expect } from "bun:test";
import { parseReadLog } from "../../../src/code_maat/parsers/git";

const entry =
  "[990442e] Adam Petersen 2013-08-29 Adapted the grammar after live tests (git)\n" +
  "1\t0\tproject.clj\n" +
  "2\t4\tsrc/code_maat/parsers/git.clj\n";

const binaryEntry =
  "[990442e] Adam Petersen 2013-11-10 Testing binary entries\n" +
  "-\t-\tproject.bin\n" +
  "2\t40\tsrc/code_maat/parsers/git.clj\n";

const entries =
  "[b777738] Adam Petersen 2013-08-29 git: parse merges and reverts too (grammar change)\n" +
  "10\t9\tsrc/code_maat/parsers/git.clj\n" +
  "32\t0\ttest/code_maat/parsers/git_test.clj\n\n" +
  "[a527b79] Adam Petersen 2013-08-29 git: proper error messages from instaparse\n" +
  "6\t2\tsrc/code_maat/parsers/git.clj\n" +
  "0\t7\ttest/code_maat/end_to_end/scenario_tests.clj\n" +
  "18\t0\ttest/code_maat/end_to_end/simple_git.txt\n" +
  "21\t0\ttest/code_maat/end_to_end/svn_live_data_test.clj\n\n" +
  "[a32793d] Ola Flisbäck 2015-09-29 Corrected date of self-awareness to 1997-08-29\n" +
  "1\t1\tREADME.md\n";

const pullRequests =
  "[0d3de0c] Mr X 2013-01-04 Merge pull request #1841 from adriaanm/rebase-6827-2.10.x\n" +
  "[77c8751] Mr Y 2013-01-04 SI-6915 Updates copyright properties to 2002-2013\n" +
  "1\t1\tbuild.xml\n" +
  "1\t1\tproject/Versions.scala\n";

const messageWithDate =
  "[611a2fe] User2 2016-03-11 (JIRA-789) Some text (see mails of 2016-03-11).\n" +
  "12\t3\tProject.UnitTests/Spec.cs\n" +
  "3\t3\tOtherProject.UnitTests/OtherSpec.cs\n";

describe("git parser (legacy format)", () => {
  test("parses single entry to dataset", () => {
    expect(parseReadLog(entry, {})).toEqual([
      { locDeleted: "0", locAdded: "1", author: "Adam Petersen", rev: "990442e", date: "2013-08-29", entity: "project.clj", message: "Adapted the grammar after live tests (git)" },
      { locDeleted: "4", locAdded: "2", author: "Adam Petersen", rev: "990442e", date: "2013-08-29", entity: "src/code_maat/parsers/git.clj", message: "Adapted the grammar after live tests (git)" },
    ]);
  });

  test("parses entry with binary to dataset (churn shown as dash)", () => {
    expect(parseReadLog(binaryEntry, {})).toEqual([
      { locDeleted: "-", locAdded: "-", author: "Adam Petersen", rev: "990442e", date: "2013-11-10", entity: "project.bin", message: "Testing binary entries" },
      { locDeleted: "40", locAdded: "2", author: "Adam Petersen", rev: "990442e", date: "2013-11-10", entity: "src/code_maat/parsers/git.clj", message: "Testing binary entries" },
    ]);
  });

  test("parses multiple entries to dataset", () => {
    expect(parseReadLog(entries, {})).toEqual([
      { locDeleted: "9", locAdded: "10", author: "Adam Petersen", rev: "b777738", date: "2013-08-29", entity: "src/code_maat/parsers/git.clj", message: "git: parse merges and reverts too (grammar change)" },
      { locDeleted: "0", locAdded: "32", author: "Adam Petersen", rev: "b777738", date: "2013-08-29", entity: "test/code_maat/parsers/git_test.clj", message: "git: parse merges and reverts too (grammar change)" },
      { locDeleted: "2", locAdded: "6", author: "Adam Petersen", rev: "a527b79", date: "2013-08-29", entity: "src/code_maat/parsers/git.clj", message: "git: proper error messages from instaparse" },
      { locDeleted: "7", locAdded: "0", author: "Adam Petersen", rev: "a527b79", date: "2013-08-29", entity: "test/code_maat/end_to_end/scenario_tests.clj", message: "git: proper error messages from instaparse" },
      { locDeleted: "0", locAdded: "18", author: "Adam Petersen", rev: "a527b79", date: "2013-08-29", entity: "test/code_maat/end_to_end/simple_git.txt", message: "git: proper error messages from instaparse" },
      { locDeleted: "0", locAdded: "21", author: "Adam Petersen", rev: "a527b79", date: "2013-08-29", entity: "test/code_maat/end_to_end/svn_live_data_test.clj", message: "git: proper error messages from instaparse" },
      { locDeleted: "1", locAdded: "1", author: "Ola Flisbäck", rev: "a32793d", date: "2015-09-29", entity: "README.md", message: "Corrected date of self-awareness to 1997-08-29" },
    ]);
  });

  test("parses empty log to empty dataset", () => {
    expect(parseReadLog("", {})).toEqual([]);
  });

  test("parses pull requests (skips commits without file changes, uses last commit header)", () => {
    expect(parseReadLog(pullRequests, {})).toEqual([
      { locDeleted: "1", locAdded: "1", author: "Mr Y", rev: "77c8751", date: "2013-01-04", entity: "build.xml", message: "SI-6915 Updates copyright properties to 2002-2013" },
      { locDeleted: "1", locAdded: "1", author: "Mr Y", rev: "77c8751", date: "2013-01-04", entity: "project/Versions.scala", message: "SI-6915 Updates copyright properties to 2002-2013" },
    ]);
  });

  test("ignores dates in commit messages (regression #35)", () => {
    expect(parseReadLog(messageWithDate, {})).toEqual([
      { author: "User2", date: "2016-03-11", entity: "Project.UnitTests/Spec.cs", locAdded: "12", locDeleted: "3", message: "(JIRA-789) Some text (see mails of 2016-03-11).", rev: "611a2fe" },
      { author: "User2", date: "2016-03-11", entity: "OtherProject.UnitTests/OtherSpec.cs", locAdded: "3", locDeleted: "3", message: "(JIRA-789) Some text (see mails of 2016-03-11).", rev: "611a2fe" },
    ]);
  });
});
