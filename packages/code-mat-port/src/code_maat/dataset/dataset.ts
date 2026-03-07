export function isEmpty<T>(ds: T[]): boolean {
  return ds.length === 0;
}

export function groupBy<T extends Record<string, unknown>>(
  ds: T[],
  key: keyof T
): Record<string, T[]> {
  return ds.reduce((acc, row) => {
    const k = String(row[key]);
    acc[k] = acc[k] ?? [];
    acc[k].push(row);
    return acc;
  }, {} as Record<string, T[]>);
}

export function selectColumn<T extends Record<string, unknown>>(
  ds: T[],
  key: keyof T
): unknown[] {
  return ds.map(row => row[key]);
}

export function nrows<T>(ds: T[]): number {
  return ds.length;
}

export function orderBy<T extends Record<string, unknown>>(
  ds: T[],
  key: keyof T,
  direction: "asc" | "desc" = "desc"
): T[] {
  return [...ds].sort((a, b) => {
    const av = a[key] as number;
    const bv = b[key] as number;
    return direction === "desc" ? bv - av : av - bv;
  });
}

export function where<T extends Record<string, unknown>>(
  ds: T[],
  predicate: (row: T) => boolean
): T[] {
  return ds.filter(predicate);
}
