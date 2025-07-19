import { TOptions } from "@/behave/behave";
import { Factory } from "fishery";

export const analysisOptionsFactory = Factory.define<TOptions>(() => ({
  analysisType: "abs-churn" as const,
  logFile: "git.log",
  rows: "20",
  minRevs: "10",
  minSharedRevs: "10",
  minCoupling: "2",
  maxCoupling: "10",
  maxChangesetSize: "25",
  expressionToMatch: "10",
  temporalPeriod: "1",
  ageTimeNow: "2025-07-12",
  inputEncoding: "utf-8",
  group: "10",
  teamMapFile: "team_map.csv",
  verboseResults: true,
}));
