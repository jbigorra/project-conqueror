import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import {
	type MainDevByRevs,
	MainDevByRevsSchema,
} from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

export const mainDevByRevsEffect = (input: SimpleAnalysisInput) =>
	Effect.gen(function* () {
		const codeMaat = yield* CodeMaatService;
		const raw = yield* codeMaat.runAnalysis(
			input.gitLogPath,
			buildAppOptions("main-dev-by-revs", input),
		);
		const data = yield* Schema.decodeUnknown(MainDevByRevsSchema)(raw);
		return yield* toAnalysis("main-dev-by-revs", data, input);
	});

export const mainDevByRevs = (
	input: SimpleAnalysisInput,
): Promise<Analysis<MainDevByRevs>> =>
	Effect.runPromise(
		mainDevByRevsEffect(input).pipe(Effect.provide(BehaveLive)),
	);
