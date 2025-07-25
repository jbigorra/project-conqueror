import BehaveInstance from "#behave/index.js";
import { describe, expect, it } from "vitest";

describe("Behave", () => {
  it("should be defined", () => {
    const behaveInstance = BehaveInstance.create();

    expect(behaveInstance).toBeDefined();
  });

  it("should return the same instance when calling create multiple times", () => {
    const behaveInstance1 = BehaveInstance.create();
    const behaveInstance2 = BehaveInstance.create();

    expect(behaveInstance1).toBe(behaveInstance2);
  });
});
