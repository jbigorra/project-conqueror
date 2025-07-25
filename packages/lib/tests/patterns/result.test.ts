import { Result } from "#lib/patterns/result.js";
import { describe, expect, it } from "vitest";

describe("Result", () => {
  describe("Success", () => {
    it("should create a success result", () => {
      const result = Result.success("test value");

      expect(result.isSuccess()).toBe(true);
      expect(result.isError()).toBe(false);
      expect(result.getValue()).toBe("test value");
    });

    it("should throw error when getting error from success", () => {
      const result = Result.success("test value");

      expect(() => result.getError()).toThrow("Success result has no error");
    });

    it("should work with different types", () => {
      const stringResult = Result.success("hello");
      const numberResult = Result.success(42);
      const objectResult = Result.success({ key: "value" });

      expect(stringResult.getValue()).toBe("hello");
      expect(numberResult.getValue()).toBe(42);
      expect(objectResult.getValue()).toEqual({ key: "value" });
    });
  });

  describe("Error", () => {
    it("should create an error result", () => {
      const error = new Error("test error");
      const result = Result.error(error);

      expect(result.isSuccess()).toBe(false);
      expect(result.isError()).toBe(true);
      expect(result.getError()).toBe(error);
    });

    it("should throw error when getting value from error", () => {
      const error = new Error("test error");
      const result = Result.error(error);

      expect(() => result.getValue()).toThrow("Failure result has no value");
    });

    it("should preserve error message", () => {
      const error = new Error("custom error message");
      const result = Result.error(error);

      expect(result.getError().message).toBe("custom error message");
    });
  });

  describe("map", () => {
    it("should transform success value", () => {
      const result = Result.success(5);
      const mapped = result.map((x) => x * 2);

      expect(mapped.isSuccess()).toBe(true);
      expect(mapped.getValue()).toBe(10);
    });

    it("should preserve error when mapping over error", () => {
      const error = new Error("original error");
      const result = Result.error<number>(error);
      const mapped = result.map((x: number) => x * 2);

      expect(mapped.isError()).toBe(true);
      expect(mapped.getError()).toBe(error);
    });

    it("should work with type transformations", () => {
      const result = Result.success("hello");
      const mapped = result.map((str) => str.length);

      expect(mapped.getValue()).toBe(5);
    });

    it("should handle async-like transformations", () => {
      const result = Result.success({ name: "John", age: 30 });
      const mapped = result.map(
        (user) => `${user.name} is ${user.age} years old`
      );

      expect(mapped.getValue()).toBe("John is 30 years old");
    });
  });

  describe("flatMap", () => {
    it("should chain success results", () => {
      const result = Result.success(5);
      const chained = result.flatMap((x) => Result.success(x * 2));

      expect(chained.isSuccess()).toBe(true);
      expect(chained.getValue()).toBe(10);
    });

    it("should preserve error when flatMapping over error", () => {
      const error = new Error("original error");
      const result = Result.error<number>(error);
      const chained = result.flatMap((x: number) => Result.success(x * 2));

      expect(chained.isError()).toBe(true);
      expect(chained.getError()).toBe(error);
    });

    it("should propagate error from chained operation", () => {
      const result = Result.success(5);
      const error = new Error("chained error");
      const chained = result.flatMap(() => Result.error(error));

      expect(chained.isError()).toBe(true);
      expect(chained.getError()).toBe(error);
    });

    it("should handle complex chaining", () => {
      const result = Result.success("hello");
      const chained = result
        .flatMap((str) => Result.success(str.length))
        .flatMap((len) => Result.success(len * 2))
        .flatMap((num) => Result.success(`Result: ${num}`));

      expect(chained.getValue()).toBe("Result: 10");
    });

    it("should short-circuit on first error in chain", () => {
      const error1 = new Error("first error");
      const error2 = new Error("second error");

      const result = Result.success(5);
      const chained = result
        .flatMap(() => Result.error(error1))
        .flatMap(() => Result.error(error2)); // This should not execute

      expect(chained.isError()).toBe(true);
      expect(chained.getError()).toBe(error1);
    });
  });

  describe("integration scenarios", () => {
    it("should handle validation workflow", () => {
      const validateAge = (age: number): Result<number> => {
        if (age < 0) return Result.error(new Error("Age cannot be negative"));
        if (age > 150) return Result.error(new Error("Age seems unrealistic"));
        return Result.success(age);
      };

      const calculateBirthYear = (age: number): Result<number> => {
        const currentYear = new Date().getFullYear();
        return Result.success(currentYear - age);
      };

      const result = validateAge(25).flatMap(calculateBirthYear);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toBe(new Date().getFullYear() - 25);
    });

    it("should handle validation failure", () => {
      const validateAge = (age: number): Result<number> => {
        if (age < 0) return Result.error(new Error("Age cannot be negative"));
        return Result.success(age);
      };

      const result = validateAge(-5);

      expect(result.isError()).toBe(true);
      expect(result.getError().message).toBe("Age cannot be negative");
    });

    it("should handle file operation simulation", () => {
      const readFile = (filename: string): Result<string> => {
        if (filename === "missing.txt") {
          return Result.error(new Error("File not found"));
        }
        return Result.success('{"key": "value"}');
      };

      const parseContent = (content: string): Result<object> => {
        try {
          return Result.success(JSON.parse(content));
        } catch {
          return Result.error(new Error("Invalid JSON"));
        }
      };

      const result = readFile("data.json").flatMap(parseContent);

      expect(result.isSuccess()).toBe(true);
    });

    it("should handle file operation failure", () => {
      const readFile = (filename: string): Result<string> => {
        if (filename === "missing.txt") {
          return Result.error(new Error("File not found"));
        }
        return Result.success("file content");
      };

      const result = readFile("missing.txt");

      expect(result.isError()).toBe(true);
      expect(result.getError().message).toBe("File not found");
    });
  });

  describe("edge cases", () => {
    it("should handle null and undefined values", () => {
      const nullResult = Result.success(null);
      const undefinedResult = Result.success(undefined);

      expect(nullResult.getValue()).toBe(null);
      expect(undefinedResult.getValue()).toBe(undefined);
    });

    it("should handle empty string and zero values", () => {
      const emptyString = Result.success("");
      const zero = Result.success(0);

      expect(emptyString.getValue()).toBe("");
      expect(zero.getValue()).toBe(0);
    });

    it("should handle complex objects", () => {
      const complexObject = {
        nested: {
          array: [1, 2, 3],
          function: () => "test",
        },
      };

      const result = Result.success(complexObject);

      expect(result.getValue()).toEqual(complexObject);
      expect(result.getValue().nested.array).toEqual([1, 2, 3]);
    });
  });
});
