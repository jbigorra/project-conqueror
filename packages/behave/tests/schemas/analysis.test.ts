import { describe, expect, test } from "bun:test";
import type { Analysis } from "../../src/schemas/analysis";

describe("Analysis types", () => {
  test("JSON format analysis has typed data array", () => {
    type Revision = { entity: string; nRevs: number };
    const analysis: Analysis<Revision> = {
      metadata: {
        analysisName: "revisions",
        timestamp: new Date(),
        parameters: { gitLogPath: "/path" },
        format: "json" as const,
      },
      data: [{ entity: "foo.ts", nRevs: 5 }],
    };
    expect(analysis.data).toHaveLength(1);
    expect(analysis.data[0]?.entity).toBe("foo.ts");
  });

  test("CSV format analysis has string data", () => {
    const analysis: Analysis<unknown> = {
      metadata: {
        analysisName: "revisions",
        timestamp: new Date(),
        parameters: {},
        format: "csv" as const,
      },
      data: "entity,nRevs\nfoo.ts,5",
    };
    expect(typeof analysis.data).toBe("string");
  });
});
