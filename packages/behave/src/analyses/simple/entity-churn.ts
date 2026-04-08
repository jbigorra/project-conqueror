import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type EntityChurn, EntityChurnSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

/**
 * Effect program that runs the entity churn analysis and decodes the result.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns An Effect producing an Analysis of EntityChurn records.
 */
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

/**
 * Runs an entity churn analysis showing lines added/deleted per file.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns Resolved analysis with per-entity churn metrics.
 * @throws {CodeMaatError} If code-maat analysis fails.
 *
 * @example
 * ```ts
 * const result = await entityChurn({ gitLogPath: "/tmp/project.log" });
 * ```
 */
export const entityChurn = (input: SimpleAnalysisInput): Promise<Analysis<EntityChurn>> =>
  Effect.runPromise(entityChurnEffect(input).pipe(Effect.provide(BehaveLive)));
