/// Code Maat supports analysis according to pre-defined architectural groups.
/// These groups are typically architectural boundaries. All data
/// will be aggregated into that view before analysis.

export type GroupSpec = {
  path: RegExp;
  name: string;
};

type EntityRecord = {
  entity: string;
  [key: string]: unknown;
};

// Parsing the group specification
// ================================

// A line in the spec has the form:
//   path => name
// where `path` is either a plain text path or a regex (starts with ^ and ends with $).
const LINE_PATTERN = /^(.+?)\s+=>\s+(.+)$/;

/**
 * Determines whether a path token is a regex literal (starts with ^ ... ends with $).
 */
function isRegexPath(path: string): boolean {
  return path.startsWith("^") && path.endsWith("$");
}

/**
 * Converts a plain text path into a regex that matches entities under that path.
 * e.g. "/some/path" → /^\/some\/path\//
 *
 * We must NOT escape backslashes that are already escape sequences in the input,
 * but we DO need to escape special regex metacharacters (except backslash, which
 * the user may use deliberately in the plain-text form).
 */
function plainPathToRegex(path: string): RegExp {
  // Escape regex metacharacters in the path, but keep backslashes as-is
  // so that "\\path" remains "\\path" in the pattern.
  // Characters to escape: . + * ? ( ) [ ] { } | ^ $
  // We do NOT escape backslash itself – the user's input literal backslash
  // is kept as a literal backslash in the regex.
  const escaped = path.replace(/[.+*?()[\]{}|^$]/g, "\\$&");
  return new RegExp(`^${escaped}/`);
}

/**
 * Parses a group specification text into an array of GroupSpec objects.
 *
 * Each non-empty line must have the form:
 *   path => name
 *
 * If `path` starts with ^ (and ends with $) it is treated as a raw regex.
 * Otherwise it is treated as a plain path prefix and wrapped in a prefix regex.
 */
export function textToGroupSpecification(input: string): GroupSpec[] {
  if (!input || input.trim() === "") {
    return [];
  }

  const lines = input.split("\n");
  const specs: GroupSpec[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = LINE_PATTERN.exec(trimmed);
    if (!match) {
      throw new Error(`Invalid group specification line: "${trimmed}"`);
    }

    const pathToken = match[1]!.trim();
    const name = match[2]!.trim();

    let pathRegex: RegExp;
    if (isRegexPath(pathToken)) {
      pathRegex = new RegExp(pathToken);
    } else {
      pathRegex = plainPathToRegex(pathToken);
    }

    specs.push({ path: pathRegex, name });
  }

  return specs;
}

// Mapping physical entities to logical groups
// ============================================

function entityToLogicalName(entity: string, groups: GroupSpec[]): string | undefined {
  for (const { path, name } of groups) {
    if (path.test(entity)) {
      return name;
    }
  }
  return undefined;
}

function withinGroup(entity: string, groups: GroupSpec[]): boolean {
  return groups.some(({ path }) => path.test(entity));
}

/**
 * Maps each entity record to one of the pre-defined architectural boundaries (groups).
 * Entities that don't match any group are filtered out.
 */
export function mapEntitiesToGroups(commits: EntityRecord[], groups: GroupSpec[]): EntityRecord[] {
  return commits
    .filter((commit) => withinGroup(commit.entity, groups))
    .map((commit) => {
      const logicalName = entityToLogicalName(commit.entity, groups)!;
      return { ...commit, entity: logicalName };
    });
}

/**
 * Entry point: reads a group spec file path, parses it, and maps commits to groups.
 */
export function run(groupSpecText: string, commits: EntityRecord[]): EntityRecord[] {
  const groups = textToGroupSpecification(groupSpecText);
  return mapEntitiesToGroups(commits, groups);
}
