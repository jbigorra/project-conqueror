import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type AuthorChurn, AuthorChurnSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

export const authorChurnEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService;
    const raw = yield* codeMaat.runAnalysis(
      input.gitLogPath,
      buildAppOptions("author-churn", input),
    );
    const data = yield* Schema.decodeUnknown(AuthorChurnSchema)(raw);
    return yield* toAnalysis("author-churn", data, input);
  });

export const authorChurn = (input: SimpleAnalysisInput): Promise<Analysis<AuthorChurn>> =>
  Effect.runPromise(authorChurnEffect(input).pipe(Effect.provide(BehaveLive)));
