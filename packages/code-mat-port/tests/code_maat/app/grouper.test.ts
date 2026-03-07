import { describe, it, expect } from "bun:test";
import {
  textToGroupSpecification,
  mapEntitiesToGroups,
  GroupSpec,
} from "../../../src/code_maat/app/grouper";

// Spec strings used for parsing tests
const singleGroupSpec = "/some/path => G1";

const multiGroupSpec = `/some/path => G1
/another/path => G2`;

const multiRegexpGroupSpec = `^/some/path_\\w+_group1$ => G1
^/another/path_\\w+_group2$ => G2`;

const multiMixedGroupSpec = `/some/path => G1
^/another/path/\\.*$ => G2`;

// The Clojure tests normalize patterns to strings for comparison.
// We do the same by converting each spec's path RegExp to its source string.
function comparableGroupSpec(specs: GroupSpec[]): Array<{ path: string; name: string }> {
  return specs.map((s) => ({ path: s.path.source, name: s.name }));
}

function comparableGroupSpecFor(text: string): Array<{ path: string; name: string }> {
  return comparableGroupSpec(textToGroupSpecification(text));
}

describe("parses-specification", () => {
  it("Single group", () => {
    expect(comparableGroupSpecFor(singleGroupSpec)).toEqual(
      comparableGroupSpec([{ path: /^\/some\/path\//, name: "G1" }])
    );
  });

  it("Multiple text groups", () => {
    expect(comparableGroupSpecFor(multiGroupSpec)).toEqual(
      comparableGroupSpec([
        { path: /^\/some\/path\//, name: "G1" },
        { path: /^\/another\/path\//, name: "G2" },
      ])
    );
  });

  it("Multiple regexp groups", () => {
    expect(comparableGroupSpecFor(multiRegexpGroupSpec)).toEqual(
      comparableGroupSpec([
        { path: /^\/some\/path_\w+_group1$/, name: "G1" },
        { path: /^\/another\/path_\w+_group2$/, name: "G2" },
      ])
    );
  });

  it("Multiple text and regexp groups", () => {
    expect(comparableGroupSpecFor(multiMixedGroupSpec)).toEqual(
      comparableGroupSpec([
        { path: /^\/some\/path\//, name: "G1" },
        { path: /^\/another\/path\/\.*$/, name: "G2" },
      ])
    );
  });

  it("No groups", () => {
    expect(textToGroupSpecification("")).toEqual([]);
  });

  it("With backslash", () => {
    expect(comparableGroupSpecFor("/some\\\\path => G1")).toEqual(
      comparableGroupSpec([{ path: /^\/some\\path\//, name: "G1" }])
    );
  });

  it("With dot in filename", () => {
    expect(comparableGroupSpecFor("/some/path/with.dot => G1")).toEqual(
      comparableGroupSpec([{ path: /^\/some\/path\/with\.dot\//, name: "G1" }])
    );
  });

  it("With dash in filename", () => {
    expect(comparableGroupSpecFor("/some/path/with-dash/x => G1")).toEqual(
      comparableGroupSpec([{ path: /^\/some\/path\/with\-dash\/x\//, name: "G1" }])
    );
  });
});

// Data for mapping tests
const entitiesInSameLayer = [
  { entity: "Top/A", rev: 1 },
  { entity: "Top/B", rev: 2 },
];

const entitiesMultipleLayers = [
  { entity: "Top/A", rev: 1 },
  { entity: "Bottom/B", rev: 2 },
];

const entitiesInLayers = [
  { entity: "Layer/A/Entity", rev: 1 },
  { entity: "Layer/B/Entity", rev: 2 },
];

// Group specs (as parsed GroupSpec objects with RegExp paths)
const topLevelLayer: GroupSpec[] = [{ path: /^Top\//, name: "T" }];
const multipleLayers: GroupSpec[] = [
  { path: /^Top\//, name: "Top" },
  { path: /^Bottom\//, name: "infrastructure" },
];
const regexOneLayer: GroupSpec[] = [{ path: /^.*\/A\/.*$/, name: "A Entities" }];
const regexSameLayers: GroupSpec[] = [{ path: /^.*\/Entity$/, name: "All Entities" }];
const regexMultipleLayers: GroupSpec[] = [
  { path: /^.*\/A\/.*$/, name: "A Entities" },
  { path: /^.*\/B\/.*$/, name: "B Entities" },
];

describe("entities-are-mapped-to-defined-layers", () => {
  it("Mapped to the same layer", () => {
    expect(mapEntitiesToGroups(entitiesInSameLayer, topLevelLayer)).toEqual([
      { rev: 1, entity: "T" },
      { rev: 2, entity: "T" },
    ]);
  });

  it("Mapped to different layers", () => {
    expect(mapEntitiesToGroups(entitiesMultipleLayers, multipleLayers)).toEqual([
      { rev: 1, entity: "Top" },
      { rev: 2, entity: "infrastructure" },
    ]);
  });

  it("Mapped via regex to the same layer", () => {
    expect(mapEntitiesToGroups(entitiesInLayers, regexSameLayers)).toEqual([
      { rev: 1, entity: "All Entities" },
      { rev: 2, entity: "All Entities" },
    ]);
  });

  it("Mapped via regex to different layers", () => {
    expect(mapEntitiesToGroups(entitiesInLayers, regexMultipleLayers)).toEqual([
      { rev: 1, entity: "A Entities" },
      { rev: 2, entity: "B Entities" },
    ]);
  });
});

describe("unmapped-entities-are-ignored", () => {
  it("filters out entities not matching the layer", () => {
    expect(mapEntitiesToGroups(entitiesMultipleLayers, topLevelLayer)).toEqual([
      { rev: 1, entity: "T" },
    ]);
  });

  it("filters out entities not matching regex layer", () => {
    expect(mapEntitiesToGroups(entitiesInLayers, regexOneLayer)).toEqual([
      { rev: 1, entity: "A Entities" },
    ]);
  });
});
