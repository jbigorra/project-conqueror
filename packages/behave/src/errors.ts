import { Data } from "effect";

export class CodeMaatError extends Data.TaggedError("CodeMaatError")<{
	cause: unknown;
}> {}

export class LizardError extends Data.TaggedError("LizardError")<{
	cause: unknown;
}> {}

export class FormatError extends Data.TaggedError("FormatError")<{
	message: string;
}> {}
