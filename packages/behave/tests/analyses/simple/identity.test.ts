import { describe, expect, test } from "bun:test";
import { Effect, Layer } from "effect";
import { identityEffect } from "../../../src/analyses/simple/identity";
import { CodeMaatService } from "../../../src/services/code-maat";

describe("identity analysis", () => {
  const cannedData = [{ anything: "goes" }];
  const TestLayer = Layer.succeed(CodeMaatService, {
    runAnalysis: () => Effect.succeed(cannedData),
  });

  test("returns Analysis with JSON data by default", async () => {
    const result = await Effect.runPromise(
      identityEffect({ gitLogPath: "/path/log" }).pipe(Effect.provide(TestLayer)),
    );
    expect(result.metadata.analysisName).toBe("identity");
    expect(result.metadata.format).toBe("json");
    expect(result.data).toEqual(cannedData);
  });

  test("returns Analysis with CSV data when format=csv", async () => {
    const result = await Effect.runPromise(
      identityEffect({ gitLogPath: "/path/log", format: "csv" }).pipe(Effect.provide(TestLayer)),
    );
    expect(result.metadata.format).toBe("csv");
    expect(typeof result.data).toBe("string");
  });

  test("passes options through to CodeMaatService", async () => {
    let capturedOptions: unknown;
    const SpyLayer = Layer.succeed(CodeMaatService, {
      runAnalysis: (_path, opts) => {
        capturedOptions = opts;
        return Effect.succeed(cannedData);
      },
    });
    await Effect.runPromise(
      identityEffect({ gitLogPath: "/path/log", vcsType: "git2" }).pipe(Effect.provide(SpyLayer)),
    );
    expect(capturedOptions).toEqual(
      expect.objectContaining({ analysis: "identity", versionControl: "git2" }),
    );
  });
});
