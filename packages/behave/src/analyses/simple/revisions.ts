import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type Revision, RevisionsSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

export const revisionsEffect = (input: SimpleAnalysisInput) =>
	Effect.gen(function* () {
		const codeMaat = yield* CodeMaatService;
		const raw = yield* codeMaat.runAnalysis(
			input.gitLogPath,
			buildAppOptions("revisions", input),
		);
		const data = yield* Schema.decodeUnknown(RevisionsSchema)(raw);
		return yield* toAnalysis("revisions", data, input);
	});

export const revisions = (
	input: SimpleAnalysisInput,
): Promise<Analysis<Revision>> =>
	Effect.runPromise(revisionsEffect(input).pipe(Effect.provide(BehaveLive)));
