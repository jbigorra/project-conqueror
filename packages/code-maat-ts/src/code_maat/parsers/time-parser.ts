/**
 * Creates a date converter function from a given input format hint.
 *
 * Returns a function that accepts a date string and normalizes it to `YYYY-MM-DD` format.
 * Currently supports ISO-8601 date strings (e.g. `"2013-02-08"` or `"2010-04-11T16:51:50.510404Z"`).
 * The `inputFormat` parameter is reserved for future format-specific parsing and is not
 * currently used in the conversion logic.
 *
 * @param inputFormat - A hint describing the expected date format (e.g. `"YYYY-MM-DD"`). Reserved for future use.
 * @returns A converter function `(dateStr: string) => string` that extracts the `YYYY-MM-DD` prefix.
 * @throws {Error} If the input date string cannot be matched as an ISO-8601 date.
 *
 * @example
 * const convert = timeStringConverterFrom("YYYY-MM-DD");
 * convert("2013-02-08");          // "2013-02-08"
 * convert("2010-04-11T16:51:50"); // "2010-04-11"
 */
export function timeStringConverterFrom(inputFormat: string): (dateStr: string) => string {
  return (dateStr: string) => {
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    throw new Error(`Cannot parse date: ${dateStr} with format ${inputFormat}`);
  };
}

/**
 * Creates a date parser function from a given input format hint.
 *
 * Alias for {@link timeStringConverterFrom}. Returns a function that normalizes
 * an ISO-8601 date string to `YYYY-MM-DD` format.
 *
 * @param format - A hint describing the expected date format (e.g. `"YYYY-MM-DD"`). Reserved for future use.
 * @returns A parser function `(dateStr: string) => string` that extracts the `YYYY-MM-DD` prefix.
 * @throws {Error} If the input date string cannot be matched as an ISO-8601 date.
 *
 * @example
 * const parse = timeParserFrom("YYYY-MM-DD");
 * parse("2013-02-08");          // "2013-02-08"
 * parse("2010-04-11T16:51:50"); // "2010-04-11"
 */
export function timeParserFrom(format: string): (dateStr: string) => string {
  return timeStringConverterFrom(format);
}
