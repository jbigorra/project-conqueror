/**
 * Represents a single entry parsed from a VCS log.
 *
 * Each entry corresponds to one file changed in one commit.
 *
 * @example
 * const entry: VCSEntry = {
 *   author: "alice",
 *   entity: "src/foo.ts",
 *   rev: "abc123",
 *   date: "2024-01-15",
 *   locAdded: "10",
 *   locDeleted: "3",
 *   message: "fix: handle edge case",
 * };
 */
export type VCSEntry = {
  /** The commit author's name or email. */
  author: string;
  /** Path of the file changed in this commit (the "entity" being analysed). */
  entity: string;
  /** Commit hash or revision identifier. May be a string (git) or number (svn/p4). */
  rev: string | number;
  /** ISO-format date string of the commit, e.g. `"2024-01-15"`. Optional for some VCS formats. */
  date?: string;
  /** Lines of code added in this commit. Stored as string to match raw log output. */
  locAdded?: string;
  /** Lines of code deleted in this commit. Stored as string to match raw log output. */
  locDeleted?: string;
  /** Full commit message. Only present when the VCS log includes messages. */
  message?: string;
};

/**
 * Options that control filtering and thresholds for all analyses.
 *
 * These match the CLI flags accepted by the original code-maat Java tool.
 *
 * @example
 * const opts: AnalysisOptions = {
 *   minRevs: 5,
 *   minSharedRevs: 5,
 *   minCoupling: 30,
 *   maxCoupling: 100,
 *   maxChangesetSize: 30,
 * };
 */
export type AnalysisOptions = {
  /** Minimum number of revisions an entity must have to appear in results. */
  minRevs: number;
  /** Minimum number of shared revisions for a coupling pair to be included. */
  minSharedRevs: number;
  /**
   * Minimum coupling percentage (0–100) for a pair to appear in coupling results.
   * Pairs below this threshold are filtered out.
   */
  minCoupling: number;
  /**
   * Maximum coupling percentage (0–100) for a pair to appear in coupling results.
   * Pairs above this threshold are filtered out (likely false positives from tiny files).
   */
  maxCoupling: number;
  /**
   * Maximum number of files in a single changeset.
   * Changesets larger than this are excluded from coupling analysis to avoid noise.
   */
  maxChangesetSize: number;
};
