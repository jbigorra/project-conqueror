import type { AnalysisOptions, VCSEntry } from "../../src/code_maat/types";

export const vcs: VCSEntry[] = [
  { author: "apt", entity: "A", rev: 1, message: "Some change" },
  { author: "apt", entity: "B", rev: 1, message: "Another change" },
  { author: "apt", entity: "A", rev: 2, message: "Second change" },
  { author: "jt", entity: "A", rev: 3, message: "Third change" },
];

export const singleVcs: VCSEntry[] = [{ author: "apt", entity: "A", rev: 1 }];

export const emptyVcs: VCSEntry[] = [];

export const optionsWithLowThresholds: AnalysisOptions = {
  minRevs: 1,
  minSharedRevs: 1,
  minCoupling: 50,
  maxCoupling: 100,
  maxChangesetSize: 10,
};
