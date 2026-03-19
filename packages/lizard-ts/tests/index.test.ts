import { describe, expect, it } from "bun:test";
import { Lizard, LizardInstance } from "#lizard/index.ts";

describe("LizardInstance", () => {
  it("should create a Lizard instance", () => {
    const lizard = LizardInstance.create();

    expect(lizard).toBeInstanceOf(Lizard);
  });

  it("should return the same instance on subsequent calls (singleton)", () => {
    const first = LizardInstance.create();
    const second = LizardInstance.create();

    expect(first).toBe(second);
  });
});
