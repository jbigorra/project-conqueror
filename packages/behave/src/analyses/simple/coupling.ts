import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type Coupling, CouplingSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

export const couplingEffect = (input: SimpleAnalysisInput) =>
	Effect.gen(function* () {
		const codeMaat = yield* CodeMaatService;
		const raw = yield* codeMaat.runAnalysis(
			input.gitLogPath,
			buildAppOptions("coupling", input),
		);
		const data = yield* Schema.decodeUnknown(CouplingSchema)(raw);
		return yield* toAnalysis("coupling", data, input);
	});

export const coupling = (
	input: SimpleAnalysisInput,
): Promise<Analysis<Coupling>> =>
	Effect.runPromise(couplingEffect(input).pipe(Effect.provide(BehaveLive)));
