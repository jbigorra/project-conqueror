import { join } from "node:path";
import { spawnSync } from "bun";
import type { AppOptions } from "../../src/code_maat/app/app";
import { runAnalysis } from "../../src/code_maat/app/app";

export const JAR = join(
  __dirname,
  "../../../behave/src/infrastructure/code_maat/vendor/code-maat-1.0.4-standalone.jar",
);
export const FIXTURES = join(__dirname, "../fixtures/log-fixtures");

// HEADERS[analysis]: ordered CSV column names (match JAR output)
// FIELD_MAP[analysis]: TS field name → CSV header string
// FLOAT_FIELDS[analysis]: set of CSV header names that must be formatted as floats (e.g. "1.0" not "1")
const FLOAT_FIELDS: Record<string, Set<string>> = {
  "main-dev": new Set(["ownership"]),
  "main-dev-by-revs": new Set(["ownership"]),
  "refactoring-main-dev": new Set(["ownership"]),
  fragmentation: new Set(["fractal-value"]),
};

const HEADERS: Record<string, string[]> = {
  authors: ["entity", "n-authors", "n-revs"],
  revisions: ["entity", "n-revs"],
  coupling: ["entity", "coupled", "degree", "average-revs"],
  soc: ["entity", "soc"],
  summary: ["statistic", "value"],
  "abs-churn": ["date", "added", "deleted", "commits"],
  "author-churn": ["author", "added", "deleted", "commits"],
  "entity-churn": ["entity", "added", "deleted", "commits"],
  "entity-ownership": ["entity", "author", "added", "deleted"],
  "main-dev": ["entity", "main-dev", "added", "total-added", "ownership"],
  "refactoring-main-dev": ["entity", "main-dev", "removed", "total-removed", "ownership"],
  "entity-effort": ["entity", "author", "author-revs", "total-revs"],
  "main-dev-by-revs": ["entity", "main-dev", "added", "total-added", "ownership"],
  fragmentation: ["entity", "fractal-value", "total-revs"],
  communication: ["author", "peer", "shared", "average", "strength"],
  messages: ["entity", "matches"],
  age: ["entity", "age-months"],
};

const FIELD_MAP: Record<string, Record<string, string>> = {
  authors: { entity: "entity", nAuthors: "n-authors", nRevs: "n-revs" },
  revisions: { entity: "entity", nRevs: "n-revs" },
  coupling: { entity: "entity", coupled: "coupled", degree: "degree", averageRevs: "average-revs" },
  soc: { entity: "entity", soc: "soc" },
  summary: { statistic: "statistic", value: "value" },
  "abs-churn": { date: "date", added: "added", deleted: "deleted", commits: "commits" },
  "author-churn": { author: "author", added: "added", deleted: "deleted", commits: "commits" },
  "entity-churn": { entity: "entity", added: "added", deleted: "deleted", commits: "commits" },
  "entity-ownership": { entity: "entity", author: "author", added: "added", deleted: "deleted" },
  "main-dev": {
    entity: "entity",
    mainDev: "main-dev",
    added: "added",
    totalAdded: "total-added",
    ownership: "ownership",
  },
  "refactoring-main-dev": {
    entity: "entity",
    mainDev: "main-dev",
    removed: "removed",
    totalRemoved: "total-removed",
    ownership: "ownership",
  },
  "entity-effort": {
    entity: "entity",
    author: "author",
    authorRevs: "author-revs",
    totalRevs: "total-revs",
  },
  "main-dev-by-revs": {
    entity: "entity",
    mainDev: "main-dev",
    added: "added",
    totalAdded: "total-added",
    ownership: "ownership",
  },
  fragmentation: { entity: "entity", fractalValue: "fractal-value", totalRevs: "total-revs" },
  communication: {
    author: "author",
    peer: "peer",
    shared: "shared",
    average: "average",
    strength: "strength",
  },
  messages: { entity: "entity", matches: "matches" },
  age: { entity: "entity", ageMonths: "age-months" },
};

type CsvRow = Record<string, unknown>;

function invertFieldMap(fieldMap: Record<string, string>): Record<string, string> {
  const inverseFieldMap: Record<string, string> = {};
  for (const [tsField, csvHeader] of Object.entries(fieldMap)) {
    inverseFieldMap[csvHeader] = tsField;
  }
  return inverseFieldMap;
}

function formatCsvValue(
  row: CsvRow,
  header: string,
  inverseFieldMap: Record<string, string>,
  floatFields: Set<string>,
): string {
  const fieldName = inverseFieldMap[header];
  const value = fieldName ? (row[fieldName] ?? "") : "";

  if (floatFields.has(header) && typeof value === "number") {
    return Number.isInteger(value) ? value.toFixed(1) : String(value);
  }

  return String(value);
}

function csvLineForRow(
  row: CsvRow,
  headers: string[],
  inverseFieldMap: Record<string, string>,
  floatFields: Set<string>,
): string {
  return headers
    .map((header) => formatCsvValue(row, header, inverseFieldMap, floatFields))
    .join(",");
}

export function toCSV(rows: unknown[], analysis: string): string {
  const headers = HEADERS[analysis];
  const fieldMap = FIELD_MAP[analysis];
  if (!headers || !fieldMap) throw new Error(`No CSV mapping for analysis: ${analysis}`);

  const inverseFieldMap = invertFieldMap(fieldMap);
  const floatFields = FLOAT_FIELDS[analysis] ?? new Set<string>();

  const lines = [headers.join(",")];
  for (const row of rows as CsvRow[]) {
    lines.push(csvLineForRow(row, headers, inverseFieldMap, floatFields));
  }

  return `${lines.join("\n")}\n`;
}

export function runJar(
  logFile: string,
  vcs: string,
  analysis: string,
  extra: string[] = [],
): string {
  const r = spawnSync(["java", "-jar", JAR, "-l", logFile, "-c", vcs, "-a", analysis, ...extra]);
  if (r.exitCode !== 0) throw new Error(`JAR failed: ${r.stderr}`);
  return r.stdout.toString();
}

export async function runTS(
  logFile: string,
  opts: Partial<AppOptions> & { versionControl: string; analysis: string },
): Promise<string> {
  const options: AppOptions = {
    minRevs: 5,
    minSharedRevs: 5,
    minCoupling: 30,
    maxCoupling: 100,
    maxChangesetSize: 30,
    ...opts,
  };
  return toCSV(await runAnalysis(logFile, options), opts.analysis);
}
