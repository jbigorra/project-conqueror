import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type EntityEffort, EntityEffortSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

export const entityEffortEffect = (input: SimpleAnalysisInput) =>
	Effect.gen(function* () {
		const codeMaat = yield* CodeMaatService;
		const raw = yield* codeMaat.runAnalysis(
			input.gitLogPath,
			buildAppOptions("entity-effort", input),
		);
		const data = yield* Schema.decodeUnknown(EntityEffortSchema)(raw);
		return yield* toAnalysis("entity-effort", data, input);
	});

export const entityEffort = (
	input: SimpleAnalysisInput,
): Promise<Analysis<EntityEffort>> =>
	Effect.runPromise(entityEffortEffect(input).pipe(Effect.provide(BehaveLive)));
