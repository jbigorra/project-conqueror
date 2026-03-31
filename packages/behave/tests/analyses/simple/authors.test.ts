import { describe, expect, test } from "bun:test";
import { Effect, Layer } from "effect";
import { authorsEffect } from "../../../src/analyses/simple/authors";
import { CodeMaatService } from "../../../src/services/code-maat";

describe("authors analysis", () => {
  const cannedData = [{ entity: "foo.ts", nAuthors: 3, nRevs: 10 }];
  const TestLayer = Layer.succeed(CodeMaatService, {
    runAnalysis: () => Effect.succeed(cannedData),
  });

  test("returns Analysis with JSON data by default", async () => {
    const result = await Effect.runPromise(
      authorsEffect({ gitLogPath: "/path/log" }).pipe(Effect.provide(TestLayer)),
    );
    expect(result.metadata.analysisName).toBe("authors");
    expect(result.metadata.format).toBe("json");
    expect(result.data).toEqual(cannedData);
  });

  test("returns Analysis with CSV data when format=csv", async () => {
    const result = await Effect.runPromise(
      authorsEffect({ gitLogPath: "/path/log", format: "csv" }).pipe(Effect.provide(TestLayer)),
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
      authorsEffect({ gitLogPath: "/path/log", vcsType: "git2" }).pipe(Effect.provide(SpyLayer)),
    );
    expect(capturedOptions).toEqual(
      expect.objectContaining({ analysis: "authors", versionControl: "git2" }),
    );
  });
});
