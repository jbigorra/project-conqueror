import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type EntityOwnership, EntityOwnershipSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

/**
 * Effect program that runs the entity ownership analysis and decodes the result.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns An Effect producing an Analysis of EntityOwnership records.
 */
export const entityOwnershipEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService;
    const raw = yield* codeMaat.runAnalysis(
      input.gitLogPath,
      buildAppOptions("entity-ownership", input),
    );
    const data = yield* Schema.decodeUnknown(EntityOwnershipSchema)(raw);
    return yield* toAnalysis("entity-ownership", data, input);
  });

/**
 * Runs an entity ownership analysis showing lines added/deleted per author per file.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns Resolved analysis with ownership breakdown per entity.
 * @throws {CodeMaatError} If code-maat analysis fails.
 *
 * @example
 * ```ts
 * const result = await entityOwnership({ gitLogPath: "/tmp/project.log" });
 * ```
 */
export const entityOwnership = (input: SimpleAnalysisInput): Promise<Analysis<EntityOwnership>> =>
  Effect.runPromise(entityOwnershipEffect(input).pipe(Effect.provide(BehaveLive)));
