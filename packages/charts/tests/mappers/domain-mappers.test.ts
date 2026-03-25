import { describe, expect, it } from "bun:test";
import {
  mapAuthorsToBar,
  mapAuthorsToTreemap,
} from "../../src/mappers/authors.mapper";
import {
  mapCouplingToBubble,
  mapCouplingToBar,
} from "../../src/mappers/coupling.mapper";
import { mapSocToBar } from "../../src/mappers/soc.mapper";
import {
  mapAbsChurnToLineArea,
  mapAuthorChurnToGrouped,
  mapAuthorChurnToStacked,
  mapEntityChurnToGrouped,
  mapEntityChurnToStacked,
} from "../../src/mappers/churn.mapper";
import {
  mapOwnershipToStacked,
  mapOwnershipToDoughnut,
} from "../../src/mappers/ownership.mapper";
import {
  mapMainDevToBar,
  mapMainDevToTreemap,
  mapRefactoringDevToBar,
  mapRefactoringDevToTreemap,
} from "../../src/mappers/main-dev.mapper";
import {
  mapEffortToStacked,
  mapEffortToDoughnut,
} from "../../src/mappers/effort.mapper";
import {
  mapFragmentationToBar,
  mapFragmentationToDoughnut,
} from "../../src/mappers/fragmentation.mapper";
import {
  mapCommunicationToBubble,
  mapCommunicationToBar,
} from "../../src/mappers/communication.mapper";
import { mapMessagesToBar } from "../../src/mappers/messages.mapper";
import { mapAgeToHistogram, mapAgeToBar } from "../../src/mappers/age.mapper";
import {
  mapHotspotsToBubble,
  mapHotspotsToTreemap,
} from "../../src/mappers/hotspots.mapper";
import {
  authorsFixture,
  couplingFixture,
  socFixture,
  absChurnFixture,
  authorChurnFixture,
  entityChurnFixture,
  entityOwnershipFixture,
  mainDevFixture,
  refactoringMainDevFixture,
  entityEffortFixture,
  fragmentationFixture,
  communicationFixture,
  messagesFixture,
  ageFixture,
  hotspotsFixture,
} from "../fixtures";

// ─── Authors ────────────────────────────────────────────────────────────────

describe("mapAuthorsToBar", () => {
  it("maps entity to label and nAuthors to value", () => {
    const result = mapAuthorsToBar(authorsFixture);
    expect(result[0]).toEqual({ label: authorsFixture[0]!.entity, value: authorsFixture[0]!.nAuthors });
  });
  it("returns same length as input", () => {
    expect(mapAuthorsToBar(authorsFixture)).toHaveLength(authorsFixture.length);
  });
  it("returns empty array for empty input", () => {
    expect(mapAuthorsToBar([])).toEqual([]);
  });
});

describe("mapAuthorsToTreemap", () => {
  it("splits entity path and uses nAuthors as color", () => {
    const result = mapAuthorsToTreemap(authorsFixture);
    expect(result[0]!.path).toEqual(authorsFixture[0]!.entity.split("/"));
    expect(result[0]!.color).toBe(authorsFixture[0]!.nAuthors);
  });
  it("returns same length as input", () => {
    expect(mapAuthorsToTreemap(authorsFixture)).toHaveLength(authorsFixture.length);
  });
  it("returns empty array for empty input", () => {
    expect(mapAuthorsToTreemap([])).toEqual([]);
  });
});

// ─── Coupling ────────────────────────────────────────────────────────────────

describe("mapCouplingToBubble", () => {
  it("uses entity↔coupled as label, averageRevs as x, degree as y and r", () => {
    const result = mapCouplingToBubble(couplingFixture);
    const first = result[0]!;
    const src = couplingFixture[0]!;
    expect(first.label).toBe(`${src.entity}↔${src.coupled}`);
    expect(first.x).toBe(src.averageRevs);
    expect(first.y).toBe(src.degree);
    expect(first.r).toBe(src.degree);
  });
  it("returns same length as input", () => {
    expect(mapCouplingToBubble(couplingFixture)).toHaveLength(couplingFixture.length);
  });
  it("returns empty array for empty input", () => {
    expect(mapCouplingToBubble([])).toEqual([]);
  });
});

describe("mapCouplingToBar", () => {
  it("uses entity↔coupled as label and degree as value", () => {
    const result = mapCouplingToBar(couplingFixture);
    const first = result[0]!;
    const src = couplingFixture[0]!;
    expect(first.label).toBe(`${src.entity}↔${src.coupled}`);
    expect(first.value).toBe(src.degree);
  });
  it("returns same length as input", () => {
    expect(mapCouplingToBar(couplingFixture)).toHaveLength(couplingFixture.length);
  });
  it("returns empty array for empty input", () => {
    expect(mapCouplingToBar([])).toEqual([]);
  });
});

// ─── Soc ─────────────────────────────────────────────────────────────────────

describe("mapSocToBar", () => {
  it("maps entity to label and soc to value", () => {
    const result = mapSocToBar(socFixture);
    expect(result[0]).toEqual({ label: socFixture[0]!.entity, value: socFixture[0]!.soc });
  });
  it("returns same length as input", () => {
    expect(mapSocToBar(socFixture)).toHaveLength(socFixture.length);
  });
  it("returns empty array for empty input", () => {
    expect(mapSocToBar([])).toEqual([]);
  });
});

// ─── Churn ────────────────────────────────────────────────────────────────────

describe("mapAbsChurnToLineArea", () => {
  it("maps date to x with added and deleted series", () => {
    const result = mapAbsChurnToLineArea(absChurnFixture);
    const first = result[0]!;
    expect(first.x).toBe(absChurnFixture[0]!.date);
    const addedSeries = first.series.find((s) => s.key === "added");
    const deletedSeries = first.series.find((s) => s.key === "deleted");
    expect(addedSeries!.value).toBe(absChurnFixture[0]!.added);
    expect(deletedSeries!.value).toBe(absChurnFixture[0]!.deleted);
  });
  it("returns same length as input", () => {
    expect(mapAbsChurnToLineArea(absChurnFixture)).toHaveLength(absChurnFixture.length);
  });
  it("returns empty array for empty input", () => {
    expect(mapAbsChurnToLineArea([])).toEqual([]);
  });
});

describe("mapAuthorChurnToGrouped", () => {
  it("maps author to label with added, deleted, commits groups", () => {
    const result = mapAuthorChurnToGrouped(authorChurnFixture);
    const first = result[0]!;
    expect(first.label).toBe(authorChurnFixture[0]!.author);
    const keys = first.groups.map((g) => g.key);
    expect(keys).toContain("added");
    expect(keys).toContain("deleted");
    expect(keys).toContain("commits");
  });
  it("returns same length as input", () => {
    expect(mapAuthorChurnToGrouped(authorChurnFixture)).toHaveLength(authorChurnFixture.length);
  });
  it("returns empty array for empty input", () => {
    expect(mapAuthorChurnToGrouped([])).toEqual([]);
  });
});

describe("mapAuthorChurnToStacked", () => {
  it("maps author to label with added, deleted, commits segments", () => {
    const result = mapAuthorChurnToStacked(authorChurnFixture);
    const first = result[0]!;
    expect(first.label).toBe(authorChurnFixture[0]!.author);
    const keys = first.segments.map((s) => s.key);
    expect(keys).toContain("added");
    expect(keys).toContain("deleted");
    expect(keys).toContain("commits");
  });
  it("returns same length as input", () => {
    expect(mapAuthorChurnToStacked(authorChurnFixture)).toHaveLength(authorChurnFixture.length);
  });
  it("returns empty array for empty input", () => {
    expect(mapAuthorChurnToStacked([])).toEqual([]);
  });
});

describe("mapEntityChurnToGrouped", () => {
  it("maps entity to label with added, deleted, commits groups", () => {
    const result = mapEntityChurnToGrouped(entityChurnFixture);
    const first = result[0]!;
    expect(first.label).toBe(entityChurnFixture[0]!.entity);
    expect(first.groups.map((g) => g.key)).toContain("added");
  });
  it("returns same length as input", () => {
    expect(mapEntityChurnToGrouped(entityChurnFixture)).toHaveLength(entityChurnFixture.length);
  });
  it("returns empty array for empty input", () => {
    expect(mapEntityChurnToGrouped([])).toEqual([]);
  });
});

describe("mapEntityChurnToStacked", () => {
  it("maps entity to label with added, deleted, commits segments", () => {
    const result = mapEntityChurnToStacked(entityChurnFixture);
    const first = result[0]!;
    expect(first.label).toBe(entityChurnFixture[0]!.entity);
    expect(first.segments.map((s) => s.key)).toContain("deleted");
  });
  it("returns same length as input", () => {
    expect(mapEntityChurnToStacked(entityChurnFixture)).toHaveLength(entityChurnFixture.length);
  });
  it("returns empty array for empty input", () => {
    expect(mapEntityChurnToStacked([])).toEqual([]);
  });
});

// ─── Ownership ───────────────────────────────────────────────────────────────

describe("mapOwnershipToStacked", () => {
  it("groups by entity, each segment key is an author", () => {
    const result = mapOwnershipToStacked(entityOwnershipFixture);
    const entities = [...new Set(entityOwnershipFixture.map((r) => r.entity))];
    expect(result).toHaveLength(entities.length);
    const first = result[0]!;
    expect(first.segments.length).toBeGreaterThan(0);
  });
  it("segment values are the added amounts per author", () => {
    const result = mapOwnershipToStacked(entityOwnershipFixture);
    const engineRow = result.find((r) => r.label === "src/core/analysis-engine.ts")!;
    const aliceSeg = engineRow.segments.find((s) => s.key === "alice@example.com")!;
    expect(aliceSeg.value).toBe(890);
  });
  it("returns empty array for empty input", () => {
    expect(mapOwnershipToStacked([])).toEqual([]);
  });
});

describe("mapOwnershipToDoughnut", () => {
  it("filters by entity and maps author to label, added to value", () => {
    const result = mapOwnershipToDoughnut(entityOwnershipFixture, "src/core/analysis-engine.ts");
    expect(result).toHaveLength(3);
    expect(result[0]!.label).toBe("alice@example.com");
    expect(result[0]!.value).toBe(890);
  });
  it("returns empty array when entity not found", () => {
    expect(mapOwnershipToDoughnut(entityOwnershipFixture, "nonexistent.ts")).toEqual([]);
  });
  it("returns empty array for empty input", () => {
    expect(mapOwnershipToDoughnut([], "any.ts")).toEqual([]);
  });
});

// ─── MainDev ─────────────────────────────────────────────────────────────────

describe("mapMainDevToBar", () => {
  it("maps entity to label and ownership×100 to value", () => {
    const result = mapMainDevToBar(mainDevFixture);
    expect(result[0]!.label).toBe(mainDevFixture[0]!.entity);
    expect(result[0]!.value).toBeCloseTo(mainDevFixture[0]!.ownership * 100);
  });
  it("returns same length as input", () => {
    expect(mapMainDevToBar(mainDevFixture)).toHaveLength(mainDevFixture.length);
  });
  it("returns empty array for empty input", () => {
    expect(mapMainDevToBar([])).toEqual([]);
  });
});

describe("mapMainDevToTreemap", () => {
  it("maps entity path to path array and ownership to value", () => {
    const result = mapMainDevToTreemap(mainDevFixture);
    expect(result[0]!.path).toEqual(mainDevFixture[0]!.entity.split("/"));
    expect(result[0]!.value).toBeCloseTo(mainDevFixture[0]!.ownership * 100);
  });
  it("returns same length as input", () => {
    expect(mapMainDevToTreemap(mainDevFixture)).toHaveLength(mainDevFixture.length);
  });
  it("returns empty array for empty input", () => {
    expect(mapMainDevToTreemap([])).toEqual([]);
  });
});

describe("mapRefactoringDevToBar", () => {
  it("maps entity to label and ownership×100 to value", () => {
    const result = mapRefactoringDevToBar(refactoringMainDevFixture);
    expect(result[0]!.label).toBe(refactoringMainDevFixture[0]!.entity);
    expect(result[0]!.value).toBeCloseTo(refactoringMainDevFixture[0]!.ownership * 100);
  });
  it("returns same length as input", () => {
    expect(mapRefactoringDevToBar(refactoringMainDevFixture)).toHaveLength(refactoringMainDevFixture.length);
  });
  it("returns empty array for empty input", () => {
    expect(mapRefactoringDevToBar([])).toEqual([]);
  });
});

describe("mapRefactoringDevToTreemap", () => {
  it("maps entity path and ownership×100 as value", () => {
    const result = mapRefactoringDevToTreemap(refactoringMainDevFixture);
    expect(result[0]!.path).toEqual(refactoringMainDevFixture[0]!.entity.split("/"));
    expect(result[0]!.value).toBeCloseTo(refactoringMainDevFixture[0]!.ownership * 100);
  });
  it("returns same length as input", () => {
    expect(mapRefactoringDevToTreemap(refactoringMainDevFixture)).toHaveLength(refactoringMainDevFixture.length);
  });
  it("returns empty array for empty input", () => {
    expect(mapRefactoringDevToTreemap([])).toEqual([]);
  });
});

// ─── Effort ───────────────────────────────────────────────────────────────────

describe("mapEffortToStacked", () => {
  it("groups by entity, each segment key is an author", () => {
    const result = mapEffortToStacked(entityEffortFixture);
    const entities = [...new Set(entityEffortFixture.map((r) => r.entity))];
    expect(result).toHaveLength(entities.length);
  });
  it("segment value is authorRevs for that author", () => {
    const result = mapEffortToStacked(entityEffortFixture);
    const engineRow = result.find((r) => r.label === "src/core/analysis-engine.ts")!;
    const aliceSeg = engineRow.segments.find((s) => s.key === "alice@example.com")!;
    expect(aliceSeg.value).toBe(62);
  });
  it("returns empty array for empty input", () => {
    expect(mapEffortToStacked([])).toEqual([]);
  });
});

describe("mapEffortToDoughnut", () => {
  it("filters by entity, author to label, authorRevs to value", () => {
    const result = mapEffortToDoughnut(entityEffortFixture, "src/core/analysis-engine.ts");
    expect(result).toHaveLength(3);
    expect(result[0]!.label).toBe("alice@example.com");
    expect(result[0]!.value).toBe(62);
  });
  it("returns empty array when entity not found", () => {
    expect(mapEffortToDoughnut(entityEffortFixture, "nonexistent.ts")).toEqual([]);
  });
  it("returns empty array for empty input", () => {
    expect(mapEffortToDoughnut([], "any.ts")).toEqual([]);
  });
});

// ─── Fragmentation ────────────────────────────────────────────────────────────

describe("mapFragmentationToBar", () => {
  it("maps entity to label and fractalValue to value", () => {
    const result = mapFragmentationToBar(fragmentationFixture);
    expect(result[0]).toEqual({ label: fragmentationFixture[0]!.entity, value: fragmentationFixture[0]!.fractalValue });
  });
  it("returns same length as input", () => {
    expect(mapFragmentationToBar(fragmentationFixture)).toHaveLength(fragmentationFixture.length);
  });
  it("returns empty array for empty input", () => {
    expect(mapFragmentationToBar([])).toEqual([]);
  });
});

describe("mapFragmentationToDoughnut", () => {
  it("maps entity to label and fractalValue to value", () => {
    const result = mapFragmentationToDoughnut(fragmentationFixture);
    expect(result[0]).toEqual({ label: fragmentationFixture[0]!.entity, value: fragmentationFixture[0]!.fractalValue });
  });
  it("returns same length as input", () => {
    expect(mapFragmentationToDoughnut(fragmentationFixture)).toHaveLength(fragmentationFixture.length);
  });
  it("returns empty array for empty input", () => {
    expect(mapFragmentationToDoughnut([])).toEqual([]);
  });
});

// ─── Communication ───────────────────────────────────────────────────────────

describe("mapCommunicationToBubble", () => {
  it("uses author↔peer as label, shared as x, average as y, strength as r", () => {
    const result = mapCommunicationToBubble(communicationFixture);
    const first = result[0]!;
    const src = communicationFixture[0]!;
    expect(first.label).toBe(`${src.author}↔${src.peer}`);
    expect(first.x).toBe(src.shared);
    expect(first.y).toBe(src.average);
    expect(first.r).toBe(src.strength);
  });
  it("returns same length as input", () => {
    expect(mapCommunicationToBubble(communicationFixture)).toHaveLength(communicationFixture.length);
  });
  it("returns empty array for empty input", () => {
    expect(mapCommunicationToBubble([])).toEqual([]);
  });
});

describe("mapCommunicationToBar", () => {
  it("uses author↔peer as label and strength as value", () => {
    const result = mapCommunicationToBar(communicationFixture);
    const first = result[0]!;
    const src = communicationFixture[0]!;
    expect(first.label).toBe(`${src.author}↔${src.peer}`);
    expect(first.value).toBe(src.strength);
  });
  it("returns same length as input", () => {
    expect(mapCommunicationToBar(communicationFixture)).toHaveLength(communicationFixture.length);
  });
  it("returns empty array for empty input", () => {
    expect(mapCommunicationToBar([])).toEqual([]);
  });
});

// ─── Messages ────────────────────────────────────────────────────────────────

describe("mapMessagesToBar", () => {
  it("maps entity to label and matches to value", () => {
    const result = mapMessagesToBar(messagesFixture);
    expect(result[0]).toEqual({ label: messagesFixture[0]!.entity, value: messagesFixture[0]!.matches });
  });
  it("returns same length as input", () => {
    expect(mapMessagesToBar(messagesFixture)).toHaveLength(messagesFixture.length);
  });
  it("returns empty array for empty input", () => {
    expect(mapMessagesToBar([])).toEqual([]);
  });
});

// ─── Age ─────────────────────────────────────────────────────────────────────

describe("mapAgeToHistogram", () => {
  it("extracts ageMonths values", () => {
    const result = mapAgeToHistogram(ageFixture);
    expect(result[0]).toBe(ageFixture[0]!.ageMonths);
    expect(result).toHaveLength(ageFixture.length);
  });
  it("returns empty array for empty input", () => {
    expect(mapAgeToHistogram([])).toEqual([]);
  });
});

describe("mapAgeToBar", () => {
  it("maps entity to label and ageMonths to value", () => {
    const result = mapAgeToBar(ageFixture);
    expect(result[0]).toEqual({ label: ageFixture[0]!.entity, value: ageFixture[0]!.ageMonths });
  });
  it("returns same length as input", () => {
    expect(mapAgeToBar(ageFixture)).toHaveLength(ageFixture.length);
  });
  it("returns empty array for empty input", () => {
    expect(mapAgeToBar([])).toEqual([]);
  });
});

// ─── Hotspots ────────────────────────────────────────────────────────────────

describe("mapHotspotsToBubble", () => {
  it("maps entity to label, nRevs to x and r, cyclomaticComplexity to y", () => {
    const result = mapHotspotsToBubble(hotspotsFixture);
    const first = result[0]!;
    const src = hotspotsFixture[0]!;
    expect(first.label).toBe(src.entity);
    expect(first.x).toBe(src.nRevs);
    expect(first.y).toBe(src.cyclomaticComplexity);
    expect(first.r).toBe(src.nRevs);
  });
  it("returns same length as input", () => {
    expect(mapHotspotsToBubble(hotspotsFixture)).toHaveLength(hotspotsFixture.length);
  });
  it("returns empty array for empty input", () => {
    expect(mapHotspotsToBubble([])).toEqual([]);
  });
});

describe("mapHotspotsToTreemap", () => {
  it("maps entity path as path, nRevs as value, cyclomaticComplexity as color", () => {
    const result = mapHotspotsToTreemap(hotspotsFixture);
    const first = result[0]!;
    const src = hotspotsFixture[0]!;
    expect(first.path).toEqual(src.entity.split("/"));
    expect(first.value).toBe(src.nRevs);
    expect(first.color).toBe(src.cyclomaticComplexity);
  });
  it("returns same length as input", () => {
    expect(mapHotspotsToTreemap(hotspotsFixture)).toHaveLength(hotspotsFixture.length);
  });
  it("returns empty array for empty input", () => {
    expect(mapHotspotsToTreemap([])).toEqual([]);
  });
});
