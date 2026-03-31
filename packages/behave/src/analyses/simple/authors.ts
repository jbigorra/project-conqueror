import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type Author, AuthorsSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

export const authorsEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService;
    const raw = yield* codeMaat.runAnalysis(input.gitLogPath, buildAppOptions("authors", input));
    const data = yield* Schema.decodeUnknown(AuthorsSchema)(raw);
    return yield* toAnalysis("authors", data, input);
  });

export const authors = (input: SimpleAnalysisInput): Promise<Analysis<Author>> =>
  Effect.runPromise(authorsEffect(input).pipe(Effect.provide(BehaveLive)));
