import { Factory } from "fishery";
import { AnalysisOptions } from "../../../src/behave";

export const analysis_options_factory = Factory.define<AnalysisOptions>(
  () =>
    new AnalysisOptions({
      analysis_type: "abs-churn",
      log_file: "git.log",
      rows: "20",
      min_revs: "10",
      min_shared_revs: "10",
      min_coupling: "2",
      max_coupling: "10",
      max_changeset_size: "25",
      expression_to_match: "10",
      temporal_period: "1",
      age_time_now: "2025-07-12",
      input_encoding: "utf-8",
      group: "10",
      team_map_file: "team_map.csv",
      verbose_results: true,
    })
);
