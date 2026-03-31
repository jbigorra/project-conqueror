import { describe, expect, test } from "bun:test";
import { Effect, Layer } from "effect";
import { mainDevByRevsEffect } from "../../../src/analyses/simple/main-dev-by-revs";
import { CodeMaatService } from "../../../src/services/code-maat";

describe("main-dev-by-revs analysis", () => {
  const cannedData = [
    {
      entity: "foo.ts",
      mainDev: "alice",
      added: 80,
      totalAdded: 100,
      ownership: 0.8,
    },
  ];
  const TestLayer = Layer.succeed(CodeMaatService, {
    runAnalysis: () => Effect.succeed(cannedData),
  });

  test("returns Analysis with JSON data by default", async () => {
    const result = await Effect.runPromise(
      mainDevByRevsEffect({ gitLogPath: "/path/log" }).pipe(Effect.provide(TestLayer)),
    );
    expect(result.metadata.analysisName).toBe("main-dev-by-revs");
    expect(result.metadata.format).toBe("json");
    expect(result.data).toEqual(cannedData);
  });

  test("returns Analysis with CSV data when format=csv", async () => {
    const result = await Effect.runPromise(
      mainDevByRevsEffect({ gitLogPath: "/path/log", format: "csv" }).pipe(
        Effect.provide(TestLayer),
      ),
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
      mainDevByRevsEffect({ gitLogPath: "/path/log", vcsType: "git2" }).pipe(
        Effect.provide(SpyLayer),
      ),
    );
    expect(capturedOptions).toEqual(
      expect.objectContaining({
        analysis: "main-dev-by-revs",
        versionControl: "git2",
      }),
    );
  });
});
