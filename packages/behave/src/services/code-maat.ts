import { type AppOptions, runAnalysis } from "@prj-conq/code-maat-ts";
import { Context, Effect, Layer } from "effect";
import { CodeMaatError } from "../errors";

export class CodeMaatService extends Context.Tag("CodeMaatService")<
  CodeMaatService,
  {
    readonly runAnalysis: (
      logFilePath: string,
      options: AppOptions,
    ) => Effect.Effect<unknown[], CodeMaatError>;
  }
>() {}

export const CodeMaatLive = Layer.succeed(CodeMaatService, {
  runAnalysis: (logFilePath, options) =>
    Effect.tryPromise({
      try: () => runAnalysis(logFilePath, options),
      catch: (e) => new CodeMaatError({ cause: e }),
    }),
});
