import { Effect, Schema } from "effect";
import { withDefaults } from "../../pipeline/extract/defaults";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import {
	type ComplexityHotspot,
	mergeByEntity,
} from "../../pipeline/transform/merge-by-entity";
import type { Analysis } from "../../schemas/analysis";
import { RevisionsSchema } from "../../schemas/code-maat";
import { LizardMetricsSchema } from "../../schemas/lizard";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import { LizardService } from "../../services/lizard";
import type { ComplexityHotspotsInput } from "../../types";

export const complexityHotspotsEffect = (input: ComplexityHotspotsInput) =>
	Effect.gen(function* () {
		const codeMaat = yield* CodeMaatService;
		const lizard = yield* LizardService;

		// Extract (parallel)
		const [churnData, complexityData] = yield* Effect.all(
			[
				codeMaat.runAnalysis(input.gitLogPath, {
					analysis: "revisions",
					versionControl: input.vcsType ?? "git",
					...withDefaults(input.options),
				}),
				lizard.analyze(input.sourceDir),
			],
			{ concurrency: 2 },
		);

		// Decode
		const churn = yield* Schema.decodeUnknown(RevisionsSchema)(churnData);
		const complexity =
			yield* Schema.decodeUnknown(LizardMetricsSchema)(complexityData);

		// Transform
		const hotspots = mergeByEntity(
			churn as { entity: string; nRevs: number }[],
			complexity,
		);

		// Load
		return yield* toAnalysis("complexity-hotspots", hotspots, input);
	});

export const complexityHotspots = (
	input: ComplexityHotspotsInput,
): Promise<Analysis<ComplexityHotspot>> =>
	Effect.runPromise(
		complexityHotspotsEffect(input).pipe(Effect.provide(BehaveLive)),
	);
