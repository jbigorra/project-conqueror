import { describe, expect, it } from "bun:test";
import { parseArgs } from "../../../src/code_maat/cmd-line";

describe("test-argument-parsing", () => {
  describe("simple cmd line parsing", () => {
    it("parses -l flag with no errors", () => {
      const args = ["-l some_file.log"];
      const parsed = parseArgs(args);
      expect(parsed.errors).toBeNull();
    });
  });

  describe("valid inputs produce no errors", () => {
    it("parses long-form --log flag", () => {
      const parsed = parseArgs(["--log", "some_file.log"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.log).toBe("some_file.log");
    });

    it("parses -l flag short form", () => {
      const parsed = parseArgs(["-l", "some_file.log"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.log).toBe("some_file.log");
    });

    it("applies default analysis value", () => {
      const parsed = parseArgs(["-l", "file.log"]);
      expect(parsed.options.analysis).toBe("authors");
    });

    it("parses -a analysis flag", () => {
      const parsed = parseArgs(["-l", "file.log", "-a", "coupling"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.analysis).toBe("coupling");
    });

    it("parses --analysis long form", () => {
      const parsed = parseArgs(["--log", "file.log", "--analysis", "revisions"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.analysis).toBe("revisions");
    });

    it("parses -c version-control flag for git", () => {
      const parsed = parseArgs(["-l", "file.log", "-c", "git"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.versionControl).toBe("git");
    });

    it("parses -c version-control flag for svn", () => {
      const parsed = parseArgs(["-l", "file.log", "-c", "svn"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.versionControl).toBe("svn");
    });

    it("parses -c version-control flag for git2", () => {
      const parsed = parseArgs(["-l", "file.log", "-c", "git2"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.versionControl).toBe("git2");
    });

    it("parses -c version-control flag for hg", () => {
      const parsed = parseArgs(["-l", "file.log", "-c", "hg"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.versionControl).toBe("hg");
    });

    it("parses -c version-control flag for p4", () => {
      const parsed = parseArgs(["-l", "file.log", "-c", "p4"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.versionControl).toBe("p4");
    });

    it("parses -c version-control flag for tfs", () => {
      const parsed = parseArgs(["-l", "file.log", "-c", "tfs"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.versionControl).toBe("tfs");
    });

    it("parses -r rows flag as integer", () => {
      const parsed = parseArgs(["-l", "file.log", "-r", "10"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.rows).toBe(10);
    });

    it("parses -o outfile flag", () => {
      const parsed = parseArgs(["-l", "file.log", "-o", "output.csv"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.outfile).toBe("output.csv");
    });

    it("parses -g group flag", () => {
      const parsed = parseArgs(["-l", "file.log", "-g", "layers.txt"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.group).toBe("layers.txt");
    });

    it("parses -p team-map-file flag", () => {
      const parsed = parseArgs(["-l", "file.log", "-p", "teams.csv"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.teamMapFile).toBe("teams.csv");
    });

    it("applies default min-revs value of 5", () => {
      const parsed = parseArgs(["-l", "file.log"]);
      expect(parsed.options.minRevs).toBe(5);
    });

    it("parses -n min-revs flag as integer", () => {
      const parsed = parseArgs(["-l", "file.log", "-n", "3"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.minRevs).toBe(3);
    });

    it("applies default min-shared-revs value of 5", () => {
      const parsed = parseArgs(["-l", "file.log"]);
      expect(parsed.options.minSharedRevs).toBe(5);
    });

    it("parses -m min-shared-revs flag as integer", () => {
      const parsed = parseArgs(["-l", "file.log", "-m", "2"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.minSharedRevs).toBe(2);
    });

    it("applies default min-coupling value of 30", () => {
      const parsed = parseArgs(["-l", "file.log"]);
      expect(parsed.options.minCoupling).toBe(30);
    });

    it("parses -i min-coupling flag as integer", () => {
      const parsed = parseArgs(["-l", "file.log", "-i", "50"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.minCoupling).toBe(50);
    });

    it("applies default max-coupling value of 100", () => {
      const parsed = parseArgs(["-l", "file.log"]);
      expect(parsed.options.maxCoupling).toBe(100);
    });

    it("parses -x max-coupling flag as integer", () => {
      const parsed = parseArgs(["-l", "file.log", "-x", "80"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.maxCoupling).toBe(80);
    });

    it("applies default max-changeset-size value of 30", () => {
      const parsed = parseArgs(["-l", "file.log"]);
      expect(parsed.options.maxChangesetSize).toBe(30);
    });

    it("parses -s max-changeset-size flag as integer", () => {
      const parsed = parseArgs(["-l", "file.log", "-s", "15"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.maxChangesetSize).toBe(15);
    });

    it("parses -e expression-to-match flag", () => {
      const parsed = parseArgs(["-l", "file.log", "-e", "JIRA-\\d+"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.expressionToMatch).toBe("JIRA-\\d+");
    });

    it("parses -t temporal-period flag", () => {
      const parsed = parseArgs(["-l", "file.log", "-t", "7"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.temporalPeriod).toBe("7");
    });

    it("parses -d age-time-now flag", () => {
      const parsed = parseArgs(["-l", "file.log", "-d", "2024-01-01"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.ageTimeNow).toBe("2024-01-01");
    });

    it("parses --verbose-results flag", () => {
      const parsed = parseArgs(["-l", "file.log", "--verbose-results"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.verboseResults).toBe(true);
    });

    it("verbose-results defaults to false", () => {
      const parsed = parseArgs(["-l", "file.log"]);
      expect(parsed.options.verboseResults).toBe(false);
    });

    it("parses --input-encoding flag", () => {
      const parsed = parseArgs(["-l", "file.log", "--input-encoding", "ISO-8859-1"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.inputEncoding).toBe("ISO-8859-1");
    });

    it("parses -h help flag", () => {
      const parsed = parseArgs(["-h"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.help).toBe(true);
    });

    it("parses --help long form flag", () => {
      const parsed = parseArgs(["--help"]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.help).toBe(true);
    });
  });

  describe("invalid inputs produce errors", () => {
    it("reports an error for unknown flags", () => {
      const parsed = parseArgs(["--unknown-flag"]);
      expect(parsed.errors).not.toBeNull();
      expect(parsed.errors!.length).toBeGreaterThan(0);
    });

    it("reports an error for unsupported VCS type", () => {
      const parsed = parseArgs(["-l", "file.log", "-c", "invalid-vcs"]);
      expect(parsed.errors).not.toBeNull();
      expect(parsed.errors!.some((e) => e.includes("invalid-vcs"))).toBe(true);
    });

    it("reports an error when -l is missing its value", () => {
      const parsed = parseArgs(["-l"]);
      expect(parsed.errors).not.toBeNull();
    });

    it("reports an error when -r rows is not a number", () => {
      const parsed = parseArgs(["-l", "file.log", "-r", "notanumber"]);
      expect(parsed.errors).not.toBeNull();
    });
  });

  describe("combined flags", () => {
    it("parses multiple flags together without errors", () => {
      const parsed = parseArgs([
        "-l",
        "my.log",
        "-c",
        "git",
        "-a",
        "coupling",
        "-i",
        "20",
        "-x",
        "90",
        "-s",
        "10",
        "-n",
        "2",
        "-m",
        "3",
      ]);
      expect(parsed.errors).toBeNull();
      expect(parsed.options.log).toBe("my.log");
      expect(parsed.options.versionControl).toBe("git");
      expect(parsed.options.analysis).toBe("coupling");
      expect(parsed.options.minCoupling).toBe(20);
      expect(parsed.options.maxCoupling).toBe(90);
      expect(parsed.options.maxChangesetSize).toBe(10);
      expect(parsed.options.minRevs).toBe(2);
      expect(parsed.options.minSharedRevs).toBe(3);
    });
  });
});
