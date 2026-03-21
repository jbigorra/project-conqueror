import { Data } from "effect";

const CodeMaatError_ = Data.TaggedError("CodeMaatError")<{
	cause: unknown;
}>;
export class CodeMaatError extends CodeMaatError_ {}

const LizardError_ = Data.TaggedError("LizardError")<{
	cause: unknown;
}>;
export class LizardError extends LizardError_ {}

const FormatError_ = Data.TaggedError("FormatError")<{
	message: string;
}>;
export class FormatError extends FormatError_ {}
