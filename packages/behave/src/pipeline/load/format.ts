import { Effect } from "effect"
import { FormatError } from "../../errors"

const escapeField = (value: unknown): string => {
  const str = String(value)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export const toCsv = <T extends Record<string, unknown>>(data: T[]): Effect.Effect<string, FormatError> =>
  Effect.try({
    try: () => {
      if (data.length === 0) throw new Error("Cannot convert empty data to CSV")
      const first = data[0] as T
      const headers = Object.keys(first)
      const headerLine = headers.join(",")
      const rows = data.map((row) => headers.map((h) => escapeField(row[h])).join(","))
      return [headerLine, ...rows].join("\n")
    },
    catch: (e) => new FormatError({ message: String(e) }),
  })
