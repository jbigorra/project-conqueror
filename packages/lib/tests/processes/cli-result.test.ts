import { CLIResult } from "#lib/processes/index.js";
import { describe, expect, it } from "vitest";

describe("CLIResult", () => {
  describe("constructor", () => {
    it("should create instance with all parameters", () => {
      const error = new Error("test error");
      const result = new CLIResult(1, "stdout", "stderr", error);

      expect(result.errorCode).toBe(1);
      expect(result.stdout).toBe("stdout");
      expect(result.stderr).toBe("stderr");
      expect(result.error).toBe(error);
    });

    it("should throw error when errorCode is null", () => {
      expect(() => new CLIResult(null as any, "stdout", "stderr")).toThrow("errorCode is can't be null");
    });

    it("should accept signal as error code", () => {
      const result = new CLIResult("SIGTERM", "stdout", "stderr");

      expect(result.errorCode).toBe("SIGTERM");
    });

    it("should set error to null by default", () => {
      const result = new CLIResult(0, "stdout", "stderr");

      expect(result.error).toBeNull();
    });
  });

  describe("isSuccess", () => {
    it("should return true when error code is 0", () => {
      const result = new CLIResult(0, "", "");

      expect(result.isSuccess()).toBe(true);
    });

    it.each([1, -1, "SIGKILL" as const])("should return false when error code is %s", (errorCode) => {
      const result = new CLIResult(errorCode, "", "");

      expect(result.isSuccess()).toBe(false);
    });
  });

  describe("isFailure", () => {
    it("should return false when error code is 0", () => {
      const result = new CLIResult(0, "", "");

      expect(result.isFailure()).toBe(false);
    });

    it.each([1, -1, "SIGKILL" as const])("should return true when error code is %s", (errorCode) => {
      const result = new CLIResult(errorCode, "", "");

      expect(result.isFailure()).toBe(true);
    });
  });

  describe("errorMessage", () => {
    it("should return undefined when command succeeded", () => {
      const result = new CLIResult(0, "success output", "");

      expect(result.errorMessage()).toBeUndefined();
    });

    it.each([
      // Should return stderr when it exists
      [1, { stderr: "command not found", stdout: "", error: null }, "command not found"],
      // Should return stdout when it exists
      [1, { stderr: "", stdout: "usage: command [options]", error: null }, "usage: command [options]"],
      // Should prioritize stderr over stdout
      [1, { stderr: "command not found", stdout: "usage: command [options]", error: null }, "command not found"],
      // Should prioritize error message over stderr and stdout when error exists
      [1, { stderr: "command not found", stdout: "usage: command [options]", error: new Error("spawn failed") }, "spawn failed"],
      // Should return default message with numeric errorCode when no other messages
      [127, { stderr: "", stdout: "", error: null }, "Command failed with errorCode 127"],
      // Should return default message with signal when killed by signal when no other messages
      ["SIGTERM" as const, { stderr: "", stdout: "", error: null }, "Command failed with errorCode SIGTERM"],
    ])("should return error message when error exists", (errorCode, { stdout, stderr, error }, expectedErrorMessage) => {
      const result = new CLIResult(errorCode, stdout, stderr, error);

      expect(result.errorMessage()).toBe(expectedErrorMessage);
    });

    it("should handle whitespace-only stderr", () => {
      const result = new CLIResult(1, "", "   ");

      expect(result.errorMessage()).toBe("Command failed with errorCode 1");
    });

    it("should handle whitespace-only stdout", () => {
      const result = new CLIResult(1, "   ", "");

      expect(result.errorMessage()).toBe("Command failed with errorCode 1");
    });

    it("should return undefined for success even with stderr present", () => {
      const result = new CLIResult(0, "", "warning message");

      expect(result.errorMessage()).toBeUndefined();
    });
  });
});

