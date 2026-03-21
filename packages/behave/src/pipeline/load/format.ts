import { Effect } from "effect";
import { stringify } from "csv-stringify/sync";
import { FormatError } from "../../errors";

export const toCsv = <T extends Record<string, unknown>>(
	data: readonly T[],
): Effect.Effect<string, FormatError> =>
	Effect.try({
		try: () => {
			if (data.length === 0)
				throw new Error("Cannot convert empty data to CSV");
			return stringify(data as T[], { header: true }).trimEnd();
		},
		catch: (e) => new FormatError({ message: String(e) }),
	});
