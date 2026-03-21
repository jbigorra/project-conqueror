import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type SummaryEntry, SummarySchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

export const summaryEffect = (input: SimpleAnalysisInput) =>
	Effect.gen(function* () {
		const codeMaat = yield* CodeMaatService;
		const raw = yield* codeMaat.runAnalysis(
			input.gitLogPath,
			buildAppOptions("summary", input),
		);
		const data = yield* Schema.decodeUnknown(SummarySchema)(raw);
		return yield* toAnalysis("summary", data, input);
	});

export const summary = (
	input: SimpleAnalysisInput,
): Promise<Analysis<SummaryEntry>> =>
	Effect.runPromise(summaryEffect(input).pipe(Effect.provide(BehaveLive)));
