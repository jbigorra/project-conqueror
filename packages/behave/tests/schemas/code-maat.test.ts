import { describe, expect, test } from "bun:test";
import { Schema } from "effect";
import {
  AgeSchema,
  AuthorsSchema,
  CouplingSchema,
  EntityChurnSchema,
  IdentitySchema,
  MainDevSchema,
  RevisionsSchema,
  SummarySchema,
} from "../../src/schemas/code-maat";

describe("code-maat schemas", () => {
  test("RevisionsSchema decodes { entity, nRevs }", () => {
    const raw = [{ entity: "foo.ts", nRevs: 5 }];
    const result = Schema.decodeUnknownSync(RevisionsSchema)(raw);
    expect(result[0]).toEqual({ entity: "foo.ts", nRevs: 5 });
  });
  test("AuthorsSchema decodes { entity, nAuthors, nRevs }", () => {
    const raw = [{ entity: "foo.ts", nAuthors: 3, nRevs: 10 }];
    const result = Schema.decodeUnknownSync(AuthorsSchema)(raw);
    expect(result[0]).toEqual({ entity: "foo.ts", nAuthors: 3, nRevs: 10 });
  });
  test("CouplingSchema decodes { entity, coupled, degree, averageRevs }", () => {
    const raw = [{ entity: "a.ts", coupled: "b.ts", degree: 67, averageRevs: 12 }];
    const result = Schema.decodeUnknownSync(CouplingSchema)(raw);
    expect(result[0]).toEqual({
      entity: "a.ts",
      coupled: "b.ts",
      degree: 67,
      averageRevs: 12,
    });
  });
  test("SummarySchema decodes { statistic, value: number }", () => {
    const raw = [{ statistic: "number-of-commits", value: 42 }];
    const result = Schema.decodeUnknownSync(SummarySchema)(raw);
    expect(result[0]).toEqual({ statistic: "number-of-commits", value: 42 });
  });
  test("EntityChurnSchema decodes { entity, added, deleted, commits }", () => {
    const raw = [{ entity: "foo.ts", added: 100, deleted: 20, commits: 5 }];
    const result = Schema.decodeUnknownSync(EntityChurnSchema)(raw);
    expect(result[0]).toEqual({
      entity: "foo.ts",
      added: 100,
      deleted: 20,
      commits: 5,
    });
  });
  test("MainDevSchema decodes { entity, mainDev, added, totalAdded, ownership }", () => {
    const raw = [
      {
        entity: "foo.ts",
        mainDev: "alice",
        added: 80,
        totalAdded: 100,
        ownership: 0.8,
      },
    ];
    const result = Schema.decodeUnknownSync(MainDevSchema)(raw);
    expect(result[0]?.ownership).toBe(0.8);
  });
  test("AgeSchema decodes { entity, ageMonths }", () => {
    const raw = [{ entity: "foo.ts", ageMonths: 6 }];
    const result = Schema.decodeUnknownSync(AgeSchema)(raw);
    expect(result[0]).toEqual({ entity: "foo.ts", ageMonths: 6 });
  });
  test("IdentitySchema passes through unknown data", () => {
    const raw = [{ anything: "goes", extra: 42 }];
    const result = Schema.decodeUnknownSync(IdentitySchema)(raw);
    expect(result[0]).toEqual({ anything: "goes", extra: 42 });
  });
});
