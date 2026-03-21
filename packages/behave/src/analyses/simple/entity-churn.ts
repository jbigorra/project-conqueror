import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type EntityChurn, EntityChurnSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

export const entityChurnEffect = (input: SimpleAnalysisInput) =>
	Effect.gen(function* () {
		const codeMaat = yield* CodeMaatService;
		const raw = yield* codeMaat.runAnalysis(
			input.gitLogPath,
			buildAppOptions("entity-churn", input),
		);
		const data = yield* Schema.decodeUnknown(EntityChurnSchema)(raw);
		return yield* toAnalysis("entity-churn", data, input);
	});

export const entityChurn = (
	input: SimpleAnalysisInput,
): Promise<Analysis<EntityChurn>> =>
	Effect.runPromise(entityChurnEffect(input).pipe(Effect.provide(BehaveLive)));
