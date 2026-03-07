import type { VCSEntry } from "../types";

/**
 * Parses a CSV string with columns "author,team" into a lookup map
 * from author name to team name.
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
 * Maps individual authors to teams as defined by teamLookup,
 * which is expected to be a map from author to team (strings).
 * Any author that isn't included in that mapping is simply kept as-is.
 */
export function run(commits: VCSEntry[], teamLookup: Record<string, string>): VCSEntry[] {
  return commits.map((commit) => authorToTeam(teamLookup, commit));
}
