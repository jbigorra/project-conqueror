import { Effect, Schema } from "effect";
import { FormatError } from "../../errors";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type MessageEntry, MessagesSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

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
		const raw = yield* codeMaat.runAnalysis(
			input.gitLogPath,
			buildAppOptions("messages", input),
		);
		const data = yield* Schema.decodeUnknown(MessagesSchema)(raw);
		return yield* toAnalysis("messages", data, input);
	});

export const messages = (
	input: SimpleAnalysisInput,
): Promise<Analysis<MessageEntry>> =>
	Effect.runPromise(messagesEffect(input).pipe(Effect.provide(BehaveLive)));
