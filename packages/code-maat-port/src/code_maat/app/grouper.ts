/// Code Maat supports analysis according to pre-defined architectural groups.
/// These groups are typically architectural boundaries. All data
/// will be aggregated into that view before analysis.

/**
 * A single architectural group specification mapping a path pattern to a logical name.
 *
 * The `path` field is a compiled `RegExp` used to match entity paths. The `name`
 * field is the logical group label that matching entities are renamed to.
 */
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
 */
function plainPathToRegex(path: string): RegExp {
  const escaped = path.replace(/[\\.+*?()[\]{}|^$]/g, "\\$&");
  return new RegExp(`^${escaped}/`);
}

function regexPathToRegex(path: string, lineNumber: number, line: string): RegExp {
  try {
    return new RegExp(path);
  } catch (error) {
    throw new Error(
      `Invalid regex in group specification line ${lineNumber}: "${line}". Offending regex: "${path}"`,
      { cause: error },
    );
  }
}

/**
 * Parses a group specification text into an array of `GroupSpec` objects.
 *
 * Each non-empty line must have the form `path => name`. If `path` starts
 * with `^` and ends with `$` it is treated as a raw regex; otherwise it is
 * treated as a plain path prefix and wrapped in a prefix-matching regex.
 * Empty input returns an empty array. Lines that do not match the pattern
 * throw an error.
 *
 * @param input - Multi-line string where each line is `path => name`. Plain
 *   paths are turned into prefix regexes; lines starting with `^` and ending
 *   with `$` are compiled as raw regexes.
 * @returns Array of `GroupSpec` objects with compiled `path` regexes and
 *   logical group `name` strings.
 *
 * @example
 * textToGroupSpecification("/some/path => G1\n/another/path => G2");
 * // [
 * //   { path: /^\/some\/path\//, name: "G1" },
 * //   { path: /^\/another\/path\//, name: "G2" }
 * // ]
 */
export function textToGroupSpecification(input: string): GroupSpec[] {
  if (!input || input.trim() === "") {
    return [];
  }

  const lines = input.split("\n");
  const specs: GroupSpec[] = [];

  for (const [index, line] of lines.entries()) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = LINE_PATTERN.exec(trimmed);
    if (!match) {
      throw new Error(`Invalid group specification line: "${trimmed}"`);
    }

    const pathToken = match[1]!.trim();
    const name = match[2]!.trim();
    const lineNumber = index + 1;

    let pathRegex: RegExp;
    if (isRegexPath(pathToken)) {
      pathRegex = regexPathToRegex(pathToken, lineNumber, trimmed);
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
 *
 * Each record whose `entity` path matches a `GroupSpec` regex is renamed to that
 * group's logical name. Records that do not match any group are silently filtered
 * out, so only entities belonging to a known architectural boundary appear in the
 * result. The first matching group wins when a path could match multiple specs.
 *
 * @param commits - Array of entity records, each with at least an `entity` string
 *   field. All other fields are preserved as-is.
 * @param groups - Parsed group specifications produced by `textToGroupSpecification`.
 * @returns A new array of entity records with `entity` replaced by the matched
 *   group name. Records not matching any group are excluded.
 *
 * @example
 * mapEntitiesToGroups(
 *   [{ entity: "Top/A", rev: 1 }, { entity: "Bottom/B", rev: 2 }],
 *   [{ path: /^Top\//, name: "Top" }, { path: /^Bottom\//, name: "infrastructure" }]
 * );
 * // [{ entity: "Top", rev: 1 }, { entity: "infrastructure", rev: 2 }]
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
 * Parses a group specification text and maps a list of entity records to architectural groups.
 *
 * Convenience entry-point that combines `textToGroupSpecification` and
 * `mapEntitiesToGroups` into a single call. Entities that do not match any
 * group are filtered out of the result.
 *
 * @param groupSpecText - Multi-line group spec string; each line has the form
 *   `path => name`. See `textToGroupSpecification` for format details.
 * @param commits - Array of entity records to remap. Each record must have an
 *   `entity` string field; all other fields are passed through unchanged.
 * @returns A new array of entity records with `entity` set to the matching
 *   group name. Non-matching records are excluded.
 *
 * @example
 * run("/some/path => G1", [{ entity: "some/path/file.ts", rev: 1 }]);
 * // [{ entity: "G1", rev: 1 }]
 */
export function run(groupSpecText: string, commits: EntityRecord[]): EntityRecord[] {
  const groups = textToGroupSpecification(groupSpecText);
  return mapEntitiesToGroups(commits, groups);
}
