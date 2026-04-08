import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type EntityEffort, EntityEffortSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

/**
 * Effect program that runs the entity effort analysis and decodes the result.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns An Effect producing an Analysis of EntityEffort records.
 */
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

/**
 * Runs an entity effort analysis showing revision distribution per author per file.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns Resolved analysis with per-author effort per entity.
 * @throws {CodeMaatError} If code-maat analysis fails.
 *
 * @example
 * ```ts
 * const result = await entityEffort({ gitLogPath: "/tmp/project.log" });
 * ```
 */
export const entityEffort = (input: SimpleAnalysisInput): Promise<Analysis<EntityEffort>> =>
  Effect.runPromise(entityEffortEffect(input).pipe(Effect.provide(BehaveLive)));
