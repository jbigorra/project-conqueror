import { describe, expect, test } from "bun:test";
import { Effect, Layer } from "effect";
import { CodeMaatLive, CodeMaatService } from "../../src/services/code-maat";

describe("CodeMaatService", () => {
  test("can be provided with a test layer", async () => {
    const testData = [{ entity: "foo.ts", nRevs: 5 }];
    const TestLayer = Layer.succeed(CodeMaatService, {
      runAnalysis: () => Effect.succeed(testData),
    });
    const program = Effect.gen(function* () {
      const service = yield* CodeMaatService;
      return yield* service.runAnalysis("/path", {
        analysis: "revisions",
        versionControl: "git",
        minRevs: 5,
        minSharedRevs: 5,
        minCoupling: 30,
        maxCoupling: 100,
        maxChangesetSize: 30,
      });
    });
    const result = await Effect.runPromise(program.pipe(Effect.provide(TestLayer)));
    expect(result).toEqual(testData);
  });

  test("CodeMaatLive wraps errors as CodeMaatError", async () => {
    const program = Effect.gen(function* () {
      const service = yield* CodeMaatService;
      return yield* service.runAnalysis("/nonexistent.log", {
        analysis: "revisions",
        versionControl: "git",
        minRevs: 5,
        minSharedRevs: 5,
        minCoupling: 30,
        maxCoupling: 100,
        maxChangesetSize: 30,
      });
    });
    const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(CodeMaatLive)));
    expect(exit._tag).toBe("Failure");
  });
});
