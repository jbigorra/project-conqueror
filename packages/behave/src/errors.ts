import { Data } from "effect";

/**
 * Error from the code-maat analysis engine.
 *
 * @example
 * ```ts
 * new CodeMaatError({ cause: "Invalid git log format" });
 * ```
 */
export class CodeMaatError extends Data.TaggedError("CodeMaatError")<{
  /** The underlying error or message from code-maat. */
  cause: unknown;
}> {}

/**
 * Error from the lizard complexity analysis tool.
 *
 * @example
 * ```ts
 * new LizardError({ cause: "Python lizard not found" });
 * ```
 */
export class LizardError extends Data.TaggedError("LizardError")<{
  /** The underlying error or message from lizard. */
  cause: unknown;
}> {}

/**
 * Error during output formatting (e.g. CSV conversion or missing required fields).
 *
 * @example
 * ```ts
 * new FormatError({ message: "ageTimeNow is required for age analysis" });
 * ```
 */
export class FormatError extends Data.TaggedError("FormatError")<{
  /** Human-readable description of the formatting error. */
  message: string;
}> {}
