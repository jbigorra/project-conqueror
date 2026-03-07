/**
 * Port of code_maat.app.time-based-grouper
 *
 * Sometimes we'd like to use a different temporal window than the commit.
 * For example, when multiple teams are involved, changes may have to be done
 * in multiple commits. To remove these biases, we re-group all changes
 * according to a given time window before analysis.
 *
 * Grouping commits by time involves a sliding window over the original commits.
 * The same physical commit can appear multiple times since it overlaps with
 * several slides of the window.
 */

type InputEntry = {
  entity: string;
  rev: string | number;
  date: string;
  [key: string]: unknown;
};

type OutputEntry = {
  entity: string;
  rev: string;
  date: string;
};

type TimeGroupOptions = {
  temporalPeriod: string;
};

function dateFromString(s: string): Date {
  // Parse as UTC to avoid timezone shifting
  return new Date(s + "T00:00:00Z");
}

function dateToString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d.getTime());
  result.setUTCDate(result.getUTCDate() + n);
  return result;
}

/**
 * Create a list of all date strings from start to end (inclusive), one per day.
 */
function dailyDatesBetween(start: string, end: string): string[] {
  const dates: string[] = [];
  let current = dateFromString(start);
  const endDate = dateFromString(end);
  while (current <= endDate) {
    dates.push(dateToString(current));
    current = addDays(current, 1);
  }
  return dates;
}

/**
 * Pad commits so every day from first to last commit date has an entry in the map
 * (empty array for days without commits).
 */
function padCommitsToCompleteTimeSeries(
  commits: InputEntry[]
): Map<string, InputEntry[]> {
  const grouped = new Map<string, InputEntry[]>();
  for (const c of commits) {
    const d = c.date!;
    if (!grouped.has(d)) grouped.set(d, []);
    grouped.get(d)!.push(c);
  }

  const sortedDates = [...grouped.keys()].sort();
  const firstDate = sortedDates[0]!;
  const lastDate = sortedDates[sortedDates.length - 1]!;

  const padded = new Map<string, InputEntry[]>();
  for (const date of dailyDatesBetween(firstDate, lastDate)) {
    padded.set(date, grouped.get(date) ?? []);
  }
  return padded;
}

/**
 * Return unique entries by entity, keeping first occurrence.
 */
function distinctByEntity(entries: InputEntry[]): InputEntry[] {
  const seen = new Set<string>();
  const result: InputEntry[] = [];
  for (const e of entries) {
    if (!seen.has(e.entity)) {
      seen.add(e.entity);
      result.push(e);
    }
  }
  return result;
}

/**
 * Adjust all commits in a window to use the latest date as their revision.
 * Also deduplicates by entity (keeping the first occurrence).
 */
function adjustRevisionTo(newRev: string, commits: InputEntry[]): OutputEntry[] {
  const deduped = distinctByEntity(commits);
  return deduped.map((c) => ({
    date: c.date!,
    entity: c.entity,
    rev: newRev,
  }));
}

/**
 * Combine all commits in a sliding window into a single logical changeset.
 * The revision is set to the latest date in that window.
 */
function combineCommitsToLogicalChangesets(
  windows: InputEntry[][]
): OutputEntry[] {
  const result: OutputEntry[] = [];
  for (const window of windows) {
    if (window.length === 0) continue;
    const sortedByDate = [...window].sort((a, b) =>
      a.date! < b.date! ? -1 : a.date! > b.date! ? 1 : 0
    );
    const latestDay = sortedByDate[sortedByDate.length - 1]!.date!;
    const adjusted = adjustRevisionTo(latestDay, window);
    result.push(...adjusted);
  }
  return result;
}

/**
 * Check if all sub-arrays in a window are empty.
 */
function isEmptyWindow(dayGroups: InputEntry[][]): boolean {
  return dayGroups.every((g) => g.length === 0);
}


function commitsToSlidingWindowSeq(
  timePeriod: number,
  commits: InputEntry[]
): OutputEntry[] {
  const padded = padCommitsToCompleteTimeSeries(commits);
  const sortedDates = [...padded.keys()].sort();
  const dayArrays = sortedDates.map((d) => padded.get(d)!);

  // Partition with sliding window of size timePeriod, step 1
  const windows: InputEntry[][][] = [];
  for (let i = 0; i <= dayArrays.length - timePeriod; i++) {
    windows.push(dayArrays.slice(i, i + timePeriod));
  }

  // Remove windows where all days are empty
  const nonEmptyWindows = windows.filter((w) => !isEmptyWindow(w));

  // Flatten each window into a single array of commits
  const flattenedWindows = nonEmptyWindows.map((w) => w.flat());

  return combineCommitsToLogicalChangesets(flattenedWindows);
}

function validatedTimePeriod(options: TimeGroupOptions): number {
  const { temporalPeriod } = options;
  if (!/^\d+$/.test(temporalPeriod)) {
    throw new Error(
      `Invalid time-period: the given value '${temporalPeriod}' is not an integer.`
    );
  }
  return parseInt(temporalPeriod, 10);
}

/**
 * Group VCS entries by time period using a sliding window.
 * The commit ID (rev) is set to the latest date of the window, so that
 * the rest of the analyses treat the faked grouping as belonging to the same changeset.
 */
export function byTimePeriod(
  commits: InputEntry[],
  options: TimeGroupOptions
): OutputEntry[] {
  const timePeriod = validatedTimePeriod(options);
  if (commits.length === 0) return [];
  return commitsToSlidingWindowSeq(timePeriod, commits);
}
