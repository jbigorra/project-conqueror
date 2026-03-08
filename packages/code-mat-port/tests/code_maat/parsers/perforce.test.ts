import { describe, expect, test } from "bun:test";
import { parseReadLog } from "../../../src/code_maat/parsers/perforce";

const entry =
  "Change 1108116 by user1@client on 2014/12/19 14:40:17\n" +
  "\tFix Stuff.\n" +
  "\t       More comments\n" +
  "Affected files ...\n" +
  "... //depot/project/Makefile#3 edit";

const entries =
  "Change 1108116 by user1@client on 2014/12/19 14:40:17\n" +
  "\tFix Stuff.\n" +
  "\t       More comments\n" +
  "Affected files ...\n" +
  "... //depot/project/Makefile#3 edit\n\n" +
  "Change 1108117 by user2@client on 2014/12/19 15:41:18\n" +
  "\tFix More Stuff.\n" +
  "\t       More comments\n" +
  "Affected files ...\n" +
  "... //depot/project/meta/recipes-core/udev/udev-extraconf/mount.blacklist#2 edit";

const entryWithMultipleJobs =
  "Change 399449 by lpi001@lpi001-home-fimbul on 2015/02/17 13:26:45\n" +
  "\tUps, army bliver aldrig reduceret, har altid fuld g-dags antal\n" +
  "Jobs fixed ...\n" +
  "FIM-127 on 2015/03/02 by sysgen closed\n" +
  "\tÆndringe i belægningen af g-dage\n" +
  "Affected files ...\n" +
  "... //depot/fiks/fimbul/cerkl.cxx#100 edit";

describe("perforce parser", () => {
  test("parses single entry to dataset", () => {
    expect(parseReadLog(entry, {})).toEqual([
      { author: "user1", rev: "1108116", date: "2014-12-19", entity: "/Makefile", message: "" },
    ]);
  });

  test("parses multiple entries to dataset", () => {
    expect(parseReadLog(entries, {})).toEqual([
      { author: "user1", rev: "1108116", date: "2014-12-19", entity: "/Makefile", message: "" },
      {
        author: "user2",
        rev: "1108117",
        date: "2014-12-19",
        entity: "/meta/recipes-core/udev/udev-extraconf/mount.blacklist",
        message: "",
      },
    ]);
  });

  test("parses empty log to empty dataset", () => {
    expect(parseReadLog("", {})).toEqual([]);
  });

  test("parses entries with multiple job sections (regression issue #10)", () => {
    expect(parseReadLog(entryWithMultipleJobs, {})).toEqual([
      {
        author: "lpi001",
        rev: "399449",
        date: "2015-02-17",
        entity: "/fimbul/cerkl.cxx",
        message: "",
      },
    ]);
  });
});
