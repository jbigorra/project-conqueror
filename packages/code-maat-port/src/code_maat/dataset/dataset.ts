/**
 * Returns `true` when the dataset contains no rows.
 *
 * @param ds - The array of records to test.
 * @returns `true` if `ds` is empty, `false` otherwise.
 *
 * @example
 * isEmpty([]);        // true
 * isEmpty([{ a: 1 }]); // false
 */
export function isEmpty<T>(ds: T[]): boolean {
  return ds.length === 0;
}

/**
 * Groups rows by the value of a given key, returning a map from each
 * distinct string value to the array of rows that share that value.
 *
 * @param ds - The array of records to group.
 * @param key - The property name to group by.
 * @returns An object whose keys are the stringified values of `key` and
 *   whose values are the sub-arrays of matching rows.
 *
 * @example
 * groupBy(
 *   [{ author: "alice", revs: 3 }, { author: "bob", revs: 1 }, { author: "alice", revs: 7 }],
 *   "author",
 * );
 * // { alice: [{ author: "alice", revs: 3 }, { author: "alice", revs: 7 }],
 * //   bob:   [{ author: "bob",   revs: 1 }] }
 */
export function groupBy<T extends Record<string, unknown>>(
  ds: T[],
  key: keyof T,
): Record<string, T[]> {
  return ds.reduce<Record<string, T[]>>((acc, row) => {
    const k = String(row[key]);
    acc[k] = acc[k] ?? [];
    acc[k].push(row);
    return acc;
  }, {});
}

/**
 * Extracts the values of a single column from every row in the dataset.
 *
 * @param ds - The array of records to project.
 * @param key - The property name whose values should be collected.
 * @returns An array of the values at `key` for each row, in original order.
 *
 * @example
 * selectColumn([{ entity: "src/a.ts", revs: 5 }, { entity: "src/b.ts", revs: 3 }], "entity");
 * // ["src/a.ts", "src/b.ts"]
 */
export function selectColumn<T extends Record<string, unknown>, K extends keyof T>(
  ds: T[],
  key: K,
): T[K][] {
  return ds.map((row) => row[key]);
}

/**
 * Returns the number of rows in the dataset.
 *
 * @param ds - The array of records to count.
 * @returns The length of the array.
 *
 * @example
 * nrows([{ a: 1 }, { a: 2 }]); // 2
 */
export function nrows<T>(ds: T[]): number {
  return ds.length;
}

/**
 * Returns a sorted copy of the dataset ordered by a numeric column.
 *
 * @param ds - The array of records to sort.
 * @param key - The numeric property name to sort by.
 * @param direction - `"desc"` (default) for largest-first, `"asc"` for smallest-first.
 * @returns A new array with the same rows sorted by `key`.
 *
 * @example
 * orderBy(
 *   [{ entity: "a.ts", revs: 2 }, { entity: "b.ts", revs: 8 }],
 *   "revs",
 *   "desc",
 * );
 * // [{ entity: "b.ts", revs: 8 }, { entity: "a.ts", revs: 2 }]
 */
export function orderBy<T extends Record<string, unknown>>(
  ds: T[],
  key: keyof T,
  direction: "asc" | "desc" = "desc",
): T[] {
  return [...ds].sort((a, b) => {
    const av = a[key] as number;
    const bv = b[key] as number;
    return direction === "desc" ? bv - av : av - bv;
  });
}

/**
 * Filters the dataset to only the rows that satisfy a predicate.
 *
 * @param ds - The array of records to filter.
 * @param predicate - A function that returns `true` for rows to keep.
 * @returns A new array containing only the rows for which `predicate` returned `true`.
 *
 * @example
 * where(
 *   [{ entity: "a.ts", revs: 2 }, { entity: "b.ts", revs: 8 }],
 *   (row) => row.revs > 5,
 * );
 * // [{ entity: "b.ts", revs: 8 }]
 */
export function where<T extends Record<string, unknown>>(
  ds: T[],
  predicate: (row: T) => boolean,
): T[] {
  return ds.filter(predicate);
}
