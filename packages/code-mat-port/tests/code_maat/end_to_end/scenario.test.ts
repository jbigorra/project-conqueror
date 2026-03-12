/**
 * End-to-end scenario tests that exercise the full pipeline:
 * parse log file → run analysis → assert results.
 *
 * Mirrors code_maat.end-to-end.scenario-tests (Clojure).
 *
 * All five log fixtures carry the same logical data:
 *   Rev 2: APT, 2013-02-08  → /Infrastrucure/Network/Connection.cs
 *                              /Presentation/Status/ClientPresenter.cs
 *   Rev 1: XYZ, 2013-02-07  → /Infrastrucure/Network/Connection.cs
 */

import { beforeAll, describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { byCount as authorsByCount } from "../../../src/code_maat/analysis/authors";
import { byAge } from "../../../src/code_maat/analysis/code-age";
import { bySharedEntities } from "../../../src/code_maat/analysis/communication";
import { asRevisionsPerAuthor } from "../../../src/code_maat/analysis/effort";
import { byRevision } from "../../../src/code_maat/analysis/entities";
import { byDegree } from "../../../src/code_maat/analysis/logical-coupling";
import { parseReadLog as gitParseReadLog } from "../../../src/code_maat/parsers/git";
import { parseReadLog as git2ParseReadLog } from "../../../src/code_maat/parsers/git2";
import { parseReadLog as hgParseReadLog } from "../../../src/code_maat/parsers/mercurial";
import { parseReadLog as p4ParseReadLog } from "../../../src/code_maat/parsers/perforce";

import type { AnalysisOptions, VCSEntry } from "../../../src/code_maat/types";

// ---------------------------------------------------------------------------
// Load fixture files
// ---------------------------------------------------------------------------

const FIXTURES = join(__dirname, "../../fixtures/log-fixtures");

function fixture(name: string): string {
  return readFileSync(join(FIXTURES, name), "utf-8");
}

const gitLog = fixture("simple_git.txt");
const git2Log = fixture("simple_git2.txt");
const hgLog = fixture("simple_hg.txt");
const p4Log = fixture("simple_p4.txt");

// ---------------------------------------------------------------------------
// Parse each VCS format into VCSEntry[]
// We cast here because each parser's rev is `string`, which is compatible
// with `VCSEntry.rev: string | number`.
// ---------------------------------------------------------------------------

let gitEntries: VCSEntry[];
let git2Entries: VCSEntry[];
let hgEntries: VCSEntry[];
let p4Entries: VCSEntry[];

beforeAll(() => {
  gitEntries = gitParseReadLog(gitLog, {}) as VCSEntry[];
  git2Entries = git2ParseReadLog(git2Log, {}) as VCSEntry[];
  hgEntries = hgParseReadLog(hgLog, {}) as VCSEntry[];
  p4Entries = p4ParseReadLog(p4Log, {}) as VCSEntry[];
});

// ---------------------------------------------------------------------------
// Shared analysis options — low thresholds to capture everything
// ---------------------------------------------------------------------------

const OPTIONS: AnalysisOptions = {
  minRevs: 1,
  minSharedRevs: 1,
  minCoupling: 0,
  maxCoupling: 100,
  maxChangesetSize: 1000,
};

// Reference date for code-age tests (matches Clojure scenario_tests.clj)
const AGE_REFERENCE_DATE = "2015-03-01";

// ---------------------------------------------------------------------------
// Expected results (same for every VCS format)
// ---------------------------------------------------------------------------

const EXPECTED_AUTHORS = [
  { entity: "/Infrastrucure/Network/Connection.cs", nAuthors: 2, nRevs: 2 },
  { entity: "/Presentation/Status/ClientPresenter.cs", nAuthors: 1, nRevs: 1 },
];

const EXPECTED_REVISIONS = [
  { entity: "/Infrastrucure/Network/Connection.cs", nRevs: 2 },
  { entity: "/Presentation/Status/ClientPresenter.cs", nRevs: 1 },
];

const EXPECTED_COUPLING = [
  {
    entity: "/Infrastrucure/Network/Connection.cs",
    coupled: "/Presentation/Status/ClientPresenter.cs",
    degree: 66,
    averageRevs: 2,
  },
];

const EXPECTED_EFFORT = [
  { entity: "/Infrastrucure/Network/Connection.cs", author: "APT", authorRevs: 1, totalRevs: 2 },
  { entity: "/Infrastrucure/Network/Connection.cs", author: "XYZ", authorRevs: 1, totalRevs: 2 },
  { entity: "/Presentation/Status/ClientPresenter.cs", author: "APT", authorRevs: 1, totalRevs: 1 },
];

const EXPECTED_COMMUNICATION = [
  { author: "XYZ", peer: "APT", shared: 1, average: 2, strength: 50 },
  { author: "APT", peer: "XYZ", shared: 1, average: 2, strength: 50 },
];

const EXPECTED_AGE = [
  { entity: "/Infrastrucure/Network/Connection.cs", ageMonths: 24 },
  { entity: "/Presentation/Status/ClientPresenter.cs", ageMonths: 24 },
];

// ---------------------------------------------------------------------------
// Helper: run each analysis against all four VCS entry sets
// ---------------------------------------------------------------------------

type VCSLabel = "git" | "git2" | "hg" | "p4";

function allEntries(): Array<[VCSLabel, () => VCSEntry[]]> {
  return [
    ["git", () => gitEntries],
    ["git2", () => git2Entries],
    ["hg", () => hgEntries],
    ["p4", () => p4Entries],
  ];
}

// ---------------------------------------------------------------------------
// Authors analysis
// ---------------------------------------------------------------------------

describe("analysis-of-authors", () => {
  for (const [vcs, entries] of allEntries()) {
    it(`${vcs}: counts authors and revisions per entity`, () => {
      expect(authorsByCount(entries(), OPTIONS)).toEqual(EXPECTED_AUTHORS);
    });
  }
});

// ---------------------------------------------------------------------------
// Revisions analysis
// ---------------------------------------------------------------------------

describe("analysis-of-revisions", () => {
  for (const [vcs, entries] of allEntries()) {
    it(`${vcs}: counts revisions per entity`, () => {
      expect(byRevision(entries(), OPTIONS)).toEqual(EXPECTED_REVISIONS);
    });
  }
});

// ---------------------------------------------------------------------------
// Logical coupling analysis
// ---------------------------------------------------------------------------

describe("analysis-of-coupling", () => {
  for (const [vcs, entries] of allEntries()) {
    it(`${vcs}: detects logical coupling`, () => {
      expect(byDegree(entries(), OPTIONS)).toEqual(EXPECTED_COUPLING);
    });
  }
});

// ---------------------------------------------------------------------------
// Effort analysis
// ---------------------------------------------------------------------------

describe("analysis-of-effort", () => {
  for (const [vcs, entries] of allEntries()) {
    it(`${vcs}: calculates effort (revisions per author per entity)`, () => {
      expect(asRevisionsPerAuthor(entries(), OPTIONS)).toEqual(EXPECTED_EFFORT);
    });
  }
});

// ---------------------------------------------------------------------------
// Communication analysis
// ---------------------------------------------------------------------------

describe("analysis-of-communication", () => {
  for (const [vcs, entries] of allEntries()) {
    it(`${vcs}: calculates shared authorship communication`, () => {
      expect(bySharedEntities(entries())).toEqual(EXPECTED_COMMUNICATION);
    });
  }
});

// ---------------------------------------------------------------------------
// Code age analysis
// ---------------------------------------------------------------------------

describe("analysis-of-code-age", () => {
  for (const [vcs, entries] of allEntries()) {
    it(`${vcs}: calculates age in months relative to ${AGE_REFERENCE_DATE}`, () => {
      expect(byAge(entries(), AGE_REFERENCE_DATE)).toEqual(EXPECTED_AGE);
    });
  }
});

// ---------------------------------------------------------------------------
// Git-specific: commit message pattern matching
// ---------------------------------------------------------------------------

import { byWordFrequency } from "../../../src/code_maat/analysis/commit-messages";

describe("git-specific: commit message pattern matching", () => {
  it("counts files in commits matching the pattern", () => {
    const result = byWordFrequency(gitEntries, { expressionToMatch: "stat" });
    expect(result).toEqual([{ entity: "/Infrastrucure/Network/Connection.cs", matches: 1 }]);
  });
});

// ---------------------------------------------------------------------------
// Empty log files — all analyses return empty results
// ---------------------------------------------------------------------------

const EMPTY = "";

describe("empty-log-files", () => {
  const parsers: Array<[VCSLabel, (text: string) => VCSEntry[]]> = [
    ["git", (t) => gitParseReadLog(t, {}) as VCSEntry[]],
    ["git2", (t) => git2ParseReadLog(t, {}) as VCSEntry[]],
    ["hg", (t) => hgParseReadLog(t, {}) as VCSEntry[]],
    ["p4", (t) => p4ParseReadLog(t, {}) as VCSEntry[]],
  ];

  for (const [vcs, parse] of parsers) {
    describe(`${vcs}`, () => {
      let entries: VCSEntry[];

      beforeAll(() => {
        entries = parse(EMPTY);
      });

      it("authors returns empty", () => {
        expect(authorsByCount(entries, OPTIONS)).toEqual([]);
      });

      it("revisions returns empty", () => {
        expect(byRevision(entries, OPTIONS)).toEqual([]);
      });

      it("coupling returns empty", () => {
        expect(byDegree(entries, OPTIONS)).toEqual([]);
      });

      it("effort returns empty", () => {
        expect(asRevisionsPerAuthor(entries, OPTIONS)).toEqual([]);
      });

      it("communication returns empty", () => {
        expect(bySharedEntities(entries)).toEqual([]);
      });

      it("code-age returns empty", () => {
        expect(byAge(entries, AGE_REFERENCE_DATE)).toEqual([]);
      });
    });
  }
});
