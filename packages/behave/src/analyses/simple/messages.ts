import { Effect, Schema } from "effect";
import { FormatError } from "../../errors";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type MessageEntry, MessagesSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

/**
 * Effect program that runs the messages analysis and decodes the result.
 *
 * @param input - Analysis input; requires `expressionToMatch` regex.
 * @returns An Effect producing an Analysis of MessageEntry records.
 */
export const messagesEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    if (!input.expressionToMatch) {
      return yield* Effect.fail(
        new FormatError({
          message: "expressionToMatch is required for messages analysis",
        }),
      );
    }
    const codeMaat = yield* CodeMaatService;
    const raw = yield* codeMaat.runAnalysis(input.gitLogPath, buildAppOptions("messages", input));
    const data = yield* Schema.decodeUnknown(MessagesSchema)(raw);
    return yield* toAnalysis("messages", data, input);
  });

/**
 * Runs a messages analysis counting commit message matches per entity against a regex.
 *
 * @param input - Analysis input; `expressionToMatch` is required.
 * @returns Resolved analysis with match counts per entity.
 * @throws {FormatError} If `expressionToMatch` is not provided.
 * @throws {CodeMaatError} If code-maat analysis fails.
 *
 * @example
 * ```ts
 * const result = await messages({
 *   gitLogPath: "/tmp/project.log",
 *   expressionToMatch: "fix|bug",
 * });
 * ```
 */
export const messages = (input: SimpleAnalysisInput): Promise<Analysis<MessageEntry>> =>
  Effect.runPromise(messagesEffect(input).pipe(Effect.provide(BehaveLive)));
