import type { AppOptions } from "@prj-conq/code-maat-port";
import type { SimpleAnalysisInput } from "../../types";
import { withDefaults } from "./defaults";

export const buildAppOptions = (
	analysisName: string,
	input: SimpleAnalysisInput,
): AppOptions => ({
	analysis: analysisName,
	versionControl: input.vcsType ?? "git",
	...withDefaults(input.options),
	ageTimeNow: input.ageTimeNow,
	expressionToMatch: input.expressionToMatch,
	group: input.group,
	teamMapFile: input.teamMapFile,
	temporalPeriod: input.temporalPeriod,
});
