import { Schema } from "effect";

const RawLizardItem = Schema.Struct({
  nloc: Schema.String,
  cyclomatic_complexity: Schema.String,
  token_count: Schema.String,
  parameters: Schema.String,
  length: Schema.String,
  location: Schema.String,
  file: Schema.String,
  function: Schema.String,
  long_name: Schema.String,
  start_line: Schema.String,
  end_line: Schema.String,
});

const CamelLizardItem = Schema.Struct({
  nloc: Schema.Number,
  cyclomaticComplexity: Schema.Number,
  tokenCount: Schema.Number,
  parameters: Schema.Number,
  length: Schema.Number,
  location: Schema.String,
  file: Schema.String,
  functionName: Schema.String,
  longName: Schema.String,
  startLine: Schema.Number,
  endLine: Schema.Number,
});

export const LizardFunctionMetricsItem = Schema.transform(RawLizardItem, CamelLizardItem, {
  decode: (raw) => ({
    nloc: Number(raw.nloc),
    cyclomaticComplexity: Number(raw.cyclomatic_complexity),
    tokenCount: Number(raw.token_count),
    parameters: Number(raw.parameters),
    length: Number(raw.length),
    location: raw.location,
    file: raw.file,
    functionName: raw.function,
    longName: raw.long_name,
    startLine: Number(raw.start_line),
    endLine: Number(raw.end_line),
  }),
  encode: (camel) => ({
    nloc: String(camel.nloc),
    cyclomatic_complexity: String(camel.cyclomaticComplexity),
    token_count: String(camel.tokenCount),
    parameters: String(camel.parameters),
    length: String(camel.length),
    location: camel.location,
    file: camel.file,
    function: camel.functionName,
    long_name: camel.longName,
    start_line: String(camel.startLine),
    end_line: String(camel.endLine),
  }),
});

export const LizardMetricsSchema = Schema.Array(LizardFunctionMetricsItem);

export type LizardFunctionMetric = Schema.Schema.Type<typeof LizardFunctionMetricsItem>;

export type LizardFunctionMetrics = Schema.Schema.Type<typeof LizardMetricsSchema>;
