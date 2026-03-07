import { describe, test, expect } from "bun:test";
import { timeStringConverterFrom } from "../../../src/code_maat/parsers/time-parser";

describe("time parser", () => {
  test("parses git date format (YYYY-MM-dd) and returns same format", () => {
    const parser = timeStringConverterFrom("YYYY-MM-dd");
    expect(parser("2014-12-26")).toBe("2014-12-26");
  });
});
