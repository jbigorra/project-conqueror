import type { VCSEntry } from "../types";

/**
 * Parses a CSV string with columns `author,team` into a lookup map from author name to team name.
 *
 * The first line is treated as a header and is always skipped. Each subsequent
 * non-empty line is split on the first comma: everything before the comma
 * becomes the author key and everything after becomes the team value. Leading
 * and trailing whitespace is trimmed from both sides.
 *
 * @param csvContent - A CSV string whose first line is a header (`author,team`)
 *   and whose remaining lines each have the form `AuthorName,TeamName`.
 * @returns A plain object mapping each author name to their team name.
 *
 * @example
 * fileToAuthorTeamLookup("author,team\nX,A Team\nMe Myself,B Team\n");
 * // { X: "A Team", "Me Myself": "B Team" }
 */
export function fileToAuthorTeamLookup(csvContent: string): Record<string, string> {
  const lines = csvContent.split("\n").filter((line) => line.trim().length > 0);
  // Skip the header line
  const dataLines = lines.slice(1);
  const lookup: Record<string, string> = {};
  for (const line of dataLines) {
    const commaIndex = line.indexOf(",");
    if (commaIndex === -1) continue;
    const author = line.slice(0, commaIndex).trim();
    const team = line.slice(commaIndex + 1).trim();
    lookup[author] = team;
  }
  return lookup;
}

function authorToTeam(teamLookup: Record<string, string>, commit: VCSEntry): VCSEntry {
  const mappedAuthor = teamLookup[commit.author] ?? commit.author;
  return { ...commit, author: mappedAuthor };
}

/**
 * Replaces each commit's `author` field with the team name found in `teamLookup`.
 *
 * Any author whose name is present as a key in `teamLookup` has their `author`
 * field overwritten with the corresponding team string. Authors not found in
 * the lookup are left unchanged. All other fields on each `VCSEntry` are
 * preserved as-is.
 *
 * @param commits - Array of VCS entries to remap. Each entry must have an
 *   `author` field; all other fields pass through unchanged.
 * @param teamLookup - A map from individual author names to team names,
 *   typically produced by `fileToAuthorTeamLookup`.
 * @returns A new array of `VCSEntry` objects with `author` replaced by the
 *   matching team name where available.
 *
 * @example
 * run(
 *   [{ entity: "A", rev: 1, author: "X" }, { entity: "B", rev: 2, author: "Me Myself" }],
 *   { X: "A Team", "Me Myself": "A Team" }
 * );
 * // [{ entity: "A", rev: 1, author: "A Team" }, { entity: "B", rev: 2, author: "A Team" }]
 */
export function run(commits: VCSEntry[], teamLookup: Record<string, string>): VCSEntry[] {
  return commits.map((commit) => authorToTeam(teamLookup, commit));
}
