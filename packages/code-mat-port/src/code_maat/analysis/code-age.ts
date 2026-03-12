import type { VCSEntry } from "../types";

/** One row of the code-age analysis: age of an entity in whole calendar months. */
export type CodeAgeEntry = { entity: string; ageMonths: number };

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseDate(dateStr: string): Date {
  const match = ISO_DATE_RE.exec(dateStr);
  if (!match) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (parsed.toISOString().slice(0, 10) !== dateStr) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }

  return parsed;
}

function latestCommitDates(entries: VCSEntry[], referenceDate: Date): Map<string, Date> {
  const latestByEntity = new Map<string, Date>();

  for (const entry of entries) {
    if (!entry.date) continue;

    const entryDate = parseDate(entry.date);
    if (entryDate >= referenceDate) continue;

    const latestDate = latestByEntity.get(entry.entity);
    if (!latestDate || entryDate > latestDate) {
      latestByEntity.set(entry.entity, entryDate);
    }
  }

  return latestByEntity;
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

  return [...latestCommitDates(entries, now).entries()]
    .map(([entity, latestDate]) => ({
      entity,
      ageMonths: monthsDiff(latestDate, now),
    }))
    .sort((a, b) => a.ageMonths - b.ageMonths);
}
