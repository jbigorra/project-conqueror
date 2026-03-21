import { parse } from "csv-parse/sync";
import { Effect } from "effect";
import { LizardError } from "../../errors";

export const parseLizardCsv = (
	csv: string,
): Effect.Effect<unknown[], LizardError> =>
	Effect.try({
		try: () => {
			if (csv.trim() === "") throw new Error("CSV input is empty");
			return parse(csv, {
				columns: true,
				skip_empty_lines: true,
				trim: true,
			}) as unknown[];
		},
		catch: (e) =>
			new LizardError({ cause: `Failed to parse lizard CSV: ${e}` }),
	});
