import { describe, test, expect } from "bun:test";
import { parseReadLog } from "../../../src/code_maat/parsers/tfs";

const enUsEntry =
  "-----------------------------------------------------------------------------------------------------------------------\n" +
  "Changeset: 5\n" +
  "User: Ryan Coy\n" +
  "Date: Thursday, July 23, 2015 4:34:31 PM\n" +
  "\n" +
  "Comment:\n" +
  "  Created team project folder /Project via the Team Project Creation Wizard\n" +
  "\n" +
  "Items:\n" +
  "  add $/Project\n" +
  "\n";

const checkinNotesEntry =
  "-----------------------------------------------------------------------------------------------------------------------\n" +
  "Changeset: 5\n" +
  "User: Ryan Coy\n" +
  "Date: Thursday, July 23, 2015 4:34:31 PM\n" +
  "\n" +
  "Comment:\n" +
  "  Created team project folder /Project via the Team Project Creation Wizard\n" +
  "\n" +
  "Items:\n" +
  "  add $/Project\n" +
  "\n" +
  "Check-in Notes:\n" +
  "  Documentation:\n" +
  "    An important new part of our codebase.\n";

const longCommentEntry =
  "-----------------------------------------------------------------------------------------------------------------------\n" +
  "Changeset: 5\n" +
  "User: Ryan Coy\n" +
  "Date: Thursday, July 23, 2015 4:34:31 PM\n" +
  "\n" +
  "Comment:\n" +
  "  Created team project folder /Project via the Team Project Creation Wizard\n" +
  "  Gave project a unique and colorful name\n" +
  "\n" +
  "  It really is the best project.\n" +
  "  ***NO_CI***\n" +
  "\n" +
  "Items:\n" +
  "  add $/Project\n" +
  "\n";

const proxyCheckinEntry =
  "-----------------------------------------------------------------------------------------------------------------------\n" +
  "Changeset: 5\n" +
  "User: Ryan Coy\n" +
  "Checked in by: build.server\n" +
  "Date: Thursday, July 23, 2015 4:34:31 PM\n" +
  "\n" +
  "Comment:\n" +
  "  Created team project folder /Project via the Team Project Creation Wizard\n" +
  "\n" +
  "Items:\n" +
  "  add $/Project\n" +
  "\n";

const policyWarningEntry =
  "-----------------------------------------------------------------------------------------------------------------------\n" +
  "Changeset: 5\n" +
  "User: Ryan Coy\n" +
  "Date: Thursday, July 23, 2015 4:34:31 PM\n" +
  "\n" +
  "Comment:\n" +
  "  Created team project folder /Project via the Team Project Creation Wizard\n" +
  "\n" +
  "Items:\n" +
  "  add $/Project\n" +
  "\n" +
  "Policy Warnings:\n" +
  "  Override Reason:\n" +
  "    We don't need no comments\n" +
  "\n" +
  "    Not at all\n" +
  "  Messages:\n" +
  "    Provide a comment for the check-in.\n" +
  "\n" +
  "    ...or Else\n";

const enGbEntry =
  "-----------------------------------------------------------------------------------------------------------------------\n" +
  "Changeset: 5\n" +
  "User: Ryan Coy\n" +
  "Date: 23 July 2015 16:34:31\n" +
  "\n" +
  "Comment:\n" +
  "  Created team project folder /Project via the Team Project Creation Wizard\n" +
  "\n" +
  "Items:\n" +
  "  add $/Project\n" +
  "\n";

const entries =
  "-----------------------------------------------------------------------------------------------------------------------\n" +
  "Changeset: 7\n" +
  "User: Ryan Coy\n" +
  "Date: Thursday, July 23, 2015 4:34:35 PM\n" +
  "\n" +
  "Comment:\n" +
  "  Check-in the Lab default template\n" +
  "\n" +
  "Items:\n" +
  "  add $/Project/BuildProcessTemplates/LabDefaultTemplate.11.xaml\n" +
  "\n" +
  "-----------------------------------------------------------------------------------------------------------------------\n" +
  "Changeset: 6\n" +
  "User: Ryan Coy\n" +
  "Date: Thursday, July 23, 2015 4:34:34 PM\n" +
  "\n" +
  "Comment:\n" +
  "  Checking in new Team Foundation Build Automation files.\n" +
  "\n" +
  "Items:\n" +
  "  add $/Project/BuildProcessTemplates\n" +
  "  add $/Project/BuildProcessTemplates/AzureContinuousDeployment.11.xaml\n" +
  "  add $/Project/BuildProcessTemplates/DefaultTemplate.11.1.xaml\n" +
  "  add $/Project/BuildProcessTemplates/UpgradeTemplate.xaml\n" +
  "\n" +
  "-----------------------------------------------------------------------------------------------------------------------\n" +
  "Changeset: 5\n" +
  "User: Coy, Ryan\n" +
  "Date: Thursday, July 23, 2015 4:34:31 PM\n" +
  "\n" +
  "Comment:\n" +
  "  Created team project folder /Project via the Team Project Creation Wizard\n" +
  "\n" +
  "Items:\n" +
  "  add $/Project\n" +
  "\n";

describe("tfs parser", () => {
  test("parses en-us entry to dataset", () => {
    expect(parseReadLog(enUsEntry, {})).toEqual([
      {
        author: "Ryan Coy",
        rev: "5",
        date: "2015-07-23",
        entity: "/Project",
        message: "Created team project folder /Project via the Team Project Creation Wizard",
      },
    ]);
  });

  test("parses checkin-notes entry (skips notes section)", () => {
    expect(parseReadLog(checkinNotesEntry, {})).toEqual([
      {
        author: "Ryan Coy",
        rev: "5",
        date: "2015-07-23",
        entity: "/Project",
        message: "Created team project folder /Project via the Team Project Creation Wizard",
      },
    ]);
  });

  test("parses policy warning entry (skips policy section)", () => {
    expect(parseReadLog(policyWarningEntry, {})).toEqual([
      {
        author: "Ryan Coy",
        rev: "5",
        date: "2015-07-23",
        entity: "/Project",
        message: "Created team project folder /Project via the Team Project Creation Wizard",
      },
    ]);
  });

  test("parses long comment with blank lines", () => {
    expect(parseReadLog(longCommentEntry, {})).toEqual([
      {
        author: "Ryan Coy",
        rev: "5",
        date: "2015-07-23",
        entity: "/Project",
        message:
          "Created team project folder /Project via the Team Project Creation Wizard\nGave project a unique and colorful name\nIt really is the best project.\n***NO_CI***",
      },
    ]);
  });

  test("parses proxy checkin (ignores checked-in-by line)", () => {
    expect(parseReadLog(proxyCheckinEntry, {})).toEqual([
      {
        author: "Ryan Coy",
        rev: "5",
        date: "2015-07-23",
        entity: "/Project",
        message: "Created team project folder /Project via the Team Project Creation Wizard",
      },
    ]);
  });

  test("throws on unparsable date format (en-gb)", () => {
    expect(() => parseReadLog(enGbEntry, {})).toThrow();
  });

  test("parses multiple entries to dataset", () => {
    expect(parseReadLog(entries, {})).toEqual([
      {
        author: "Ryan Coy",
        rev: "7",
        date: "2015-07-23",
        entity: "/Project/BuildProcessTemplates/LabDefaultTemplate.11.xaml",
        message: "Check-in the Lab default template",
      },
      {
        author: "Ryan Coy",
        rev: "6",
        date: "2015-07-23",
        entity: "/Project/BuildProcessTemplates",
        message: "Checking in new Team Foundation Build Automation files.",
      },
      {
        author: "Ryan Coy",
        rev: "6",
        date: "2015-07-23",
        entity: "/Project/BuildProcessTemplates/AzureContinuousDeployment.11.xaml",
        message: "Checking in new Team Foundation Build Automation files.",
      },
      {
        author: "Ryan Coy",
        rev: "6",
        date: "2015-07-23",
        entity: "/Project/BuildProcessTemplates/DefaultTemplate.11.1.xaml",
        message: "Checking in new Team Foundation Build Automation files.",
      },
      {
        author: "Ryan Coy",
        rev: "6",
        date: "2015-07-23",
        entity: "/Project/BuildProcessTemplates/UpgradeTemplate.xaml",
        message: "Checking in new Team Foundation Build Automation files.",
      },
      {
        author: "Coy, Ryan",
        rev: "5",
        date: "2015-07-23",
        entity: "/Project",
        message: "Created team project folder /Project via the Team Project Creation Wizard",
      },
    ]);
  });

  test("parses empty log to empty dataset", () => {
    expect(parseReadLog("", {})).toEqual([]);
  });
});
