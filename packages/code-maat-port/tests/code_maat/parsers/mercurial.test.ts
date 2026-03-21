import { describe, expect, test } from "bun:test";
import { parseReadLog } from "../../../src/code_maat/parsers/mercurial";

const entry = "rev: 47 author: apn <apn@somewhere.se> date: 2010-08-29 files:\n" + ".hgtags";

const entries =
  "rev: 33 author: apn date: 2010-04-14 files:\n" +
  "impl/CMakeLists.txt\n" +
  "impl/actual_mailbox.cpp\n" +
  "impl/actual_mailbox.h\n\n" +
  "rev: 32 author: xyz date: 2010-04-03 files:\n" +
  "impl/node.cpp tinch_pp/node.h";

describe("mercurial parser", () => {
  test("parses single entry to dataset", () => {
    expect(parseReadLog(entry, {})).toEqual([
      {
        author: "apn <apn@somewhere.se>",
        rev: "47",
        date: "2010-08-29",
        entity: ".hgtags",
        message: "-",
      },
    ]);
  });

  test("parses multiple entries to dataset", () => {
    expect(parseReadLog(entries, {})).toEqual([
      { author: "apn", rev: "33", date: "2010-04-14", entity: "impl/CMakeLists.txt", message: "-" },
      {
        author: "apn",
        rev: "33",
        date: "2010-04-14",
        entity: "impl/actual_mailbox.cpp",
        message: "-",
      },
      {
        author: "apn",
        rev: "33",
        date: "2010-04-14",
        entity: "impl/actual_mailbox.h",
        message: "-",
      },
      {
        author: "xyz",
        rev: "32",
        date: "2010-04-03",
        entity: "impl/node.cpp tinch_pp/node.h",
        message: "-",
      },
    ]);
  });

  test("parses empty log to empty dataset", () => {
    expect(parseReadLog("", {})).toEqual([]);
  });
});
