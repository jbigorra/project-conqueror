import { describe, expect, test } from "bun:test";
import { buildHotspotsTree } from "../../src/mappers/hotspots-tree.mapper";
import type { EnclosureHotspot } from "../../src/types/hotspots-tree.types";

describe("buildHotspotsTree", () => {
  test("single file at root produces root with one file child", () => {
    const data: EnclosureHotspot[] = [
      { entity: "index.ts", nRevs: 5, cyclomaticComplexity: 3, linesOfCode: 50 },
    ];

    const tree = buildHotspotsTree(data);
    const child = tree.children![0]!;

    expect(tree.name).toBe("root");
    expect(tree.children).toHaveLength(1);
    expect(child.name).toBe("index.ts");
    expect(child.complexityScore).toBe(3);
    expect(child.linesOfCode).toBe(50);
    expect(child.nRevs).toBe(5);
    expect(child.children).toBeUndefined();
  });

  test("nested path creates folder hierarchy", () => {
    const data: EnclosureHotspot[] = [
      { entity: "src/core/engine.ts", nRevs: 10, cyclomaticComplexity: 15, linesOfCode: 200 },
    ];

    const tree = buildHotspotsTree(data);

    expect(tree.name).toBe("root");
    expect(tree.children).toHaveLength(1);

    const src = tree.children?.[0] ?? { name: "", children: [] };
    expect(src.name).toBe("src");
    expect(src.children).toHaveLength(1);

    const core = src.children?.[0] ?? { name: "", children: [] };
    expect(core.name).toBe("core");
    expect(core.children).toHaveLength(1);

    const file = core.children?.[0] ?? { name: "" };
    expect(file.name).toBe("engine.ts");
    expect(file.complexityScore).toBe(15);
    expect(file.linesOfCode).toBe(200);
  });

  test("multiple files in the same folder share the folder node", () => {
    const data: EnclosureHotspot[] = [
      { entity: "src/a.ts", nRevs: 5, cyclomaticComplexity: 3, linesOfCode: 50 },
      { entity: "src/b.ts", nRevs: 8, cyclomaticComplexity: 7, linesOfCode: 100 },
    ];

    const tree = buildHotspotsTree(data);

    const src = tree.children?.[0] ?? { name: "", children: [] };
    expect(src.name).toBe("src");
    expect(src.children).toHaveLength(2);
    expect(src.children?.map((c) => c.name).sort()).toEqual(["a.ts", "b.ts"]);
  });

  test("empty input returns root with no children", () => {
    const tree = buildHotspotsTree([]);

    expect(tree.name).toBe("root");
    expect(tree.children).toBeUndefined();
  });
});

describe("folder aggregates", () => {
  const fixture: EnclosureHotspot[] = [
    { entity: "src/core/engine.ts", nRevs: 10, cyclomaticComplexity: 15, linesOfCode: 200 },
    { entity: "src/core/parser.ts", nRevs: 5, cyclomaticComplexity: 8, linesOfCode: 100 },
    { entity: "src/utils/format.ts", nRevs: 3, cyclomaticComplexity: 2, linesOfCode: 50 },
  ];

  test("leaf folder has correct immediate counts", () => {
    const tree = buildHotspotsTree(fixture);
    const core = tree.children?.[0]?.children?.[0] ?? { immediateFiles: 0, immediateFolders: 0 };
    expect(core.immediateFiles).toBe(2);
    expect(core.immediateFolders).toBe(0);
  });

  test("parent folder counts immediate subfolders", () => {
    const tree = buildHotspotsTree(fixture);
    const src = tree.children?.[0] ?? { immediateFiles: 0, immediateFolders: 0 };
    expect(src.immediateFiles).toBe(0);
    expect(src.immediateFolders).toBe(2);
  });

  test("folder has correct totalFiles and totalFolders", () => {
    const tree = buildHotspotsTree(fixture);
    const src = tree.children?.[0] ?? { totalFiles: 0, totalFolders: 0 };
    expect(src.totalFiles).toBe(3);
    expect(src.totalFolders).toBe(2);
  });

  test("folder totalLinesOfCode is recursive sum", () => {
    const tree = buildHotspotsTree(fixture);
    const core = tree.children?.[0]?.children?.[0] ?? { totalLinesOfCode: 0 };
    expect(core.totalLinesOfCode).toBe(300);
  });

  test("folder averageComplexity is mean of descendant file complexities", () => {
    const tree = buildHotspotsTree(fixture);
    const src = tree.children?.[0] ?? { averageComplexity: 0 };
    // (15 + 8 + 2) / 3 ≈ 8.33
    expect(src.averageComplexity).toBeCloseTo(8.33, 1);
  });

  test("root has aggregates for all files", () => {
    const tree = buildHotspotsTree(fixture);
    expect(tree.totalFiles).toBe(3);
    expect(tree.totalFolders).toBe(3); // src, core, utils
    expect(tree.totalLinesOfCode).toBe(350);
    expect(tree.averageComplexity).toBeCloseTo(8.33, 1);
  });
});
