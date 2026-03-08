import type { VCSEntry } from "../types";

/** One row of the code-age analysis: age of an entity in whole calendar months. */
export type CodeAgeEntry = { entity: string; ageMonths: number };

function parseDate(dateStr: string): Date {
  // Parse "YYYY-MM-DD" as UTC to avoid timezone offset issues
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year!, month! - 1, day!));
}

function monthsDiff(from: Date, to: Date): number {
  // Calculate whole months between from and to (to >= from)
  const years = to.getUTCFullYear() - from.getUTCFullYear();
  const months = to.getUTCMonth() - from.getUTCMonth();
  const days = to.getUTCDate() - from.getUTCDate();
  let totalMonths = years * 12 + months;
  if (days < 0) {
    totalMonths -= 1;
  }
  return Math.max(0, totalMonths);
}

/**
 * Calculates the age (in whole calendar months) of each entity based on its most
 * recent commit date that falls strictly before the reference date.
 *
 * Entries whose date is on or after the reference date are excluded, ensuring only
 * committed history is analysed. Age is computed in whole months (partial months are
 * rounded down). Entities with no qualifying commits are omitted from the result.
 * Results are sorted ascending by age so the most-recently-touched entities appear first.
 *
 * @param entries - VCS log entries. Each entry must have a `date` field in "YYYY-MM-DD"
 *   format; entries without a date are silently skipped.
 * @param referenceDate - Optional ISO date string ("YYYY-MM-DD") to use as "now".
 *   Defaults to the current wall-clock date when omitted.
 * @returns Array of `CodeAgeEntry` sorted ascending by `ageMonths`. Each record contains
 *   `entity` (path) and `ageMonths` (whole months since last commit before reference).
 *
 * @example
 * byAge(entries, "2014-01-01");
 * // [
 * //   { entity: "src/core.ts", ageMonths: 0 },
 * //   { entity: "src/legacy.ts", ageMonths: 14 },
 * // ]
 */
export function byAge(entries: VCSEntry[], referenceDate?: string): CodeAgeEntry[] {
  const now = referenceDate ? parseDate(referenceDate) : new Date();

  // Group entries by entity
  const groups: Record<string, Date[]> = {};
  for (const entry of entries) {
    if (!entry.date) continue;
    const entryDate = parseDate(entry.date);
    // Only include commits strictly before the reference date
    if (entryDate >= now) continue;
    if (!groups[entry.entity]) groups[entry.entity] = [];
    groups[entry.entity]!.push(entryDate);
  }

  const result: CodeAgeEntry[] = [];
  for (const [entity, dates] of Object.entries(groups)) {
    if (dates.length === 0) continue;
    // Find the most recent commit date
    const latestDate = dates.reduce((max, d) => (d > max ? d : max));
    const ageMonths = monthsDiff(latestDate, now);
    result.push({ entity, ageMonths });
  }

  // Sort ascending by age
  result.sort((a, b) => a.ageMonths - b.ageMonths);

  return result;
}
