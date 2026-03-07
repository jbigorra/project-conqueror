import type { VCSEntry } from "../types";

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
 * Calculates the age (in whole months) of each entity based on its most
 * recent commit date that is strictly before the reference date.
 *
 * @param entries    - VCS log entries
 * @param referenceDate - ISO date string "YYYY-MM-DD" to use as "now"
 *                        (defaults to today)
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
