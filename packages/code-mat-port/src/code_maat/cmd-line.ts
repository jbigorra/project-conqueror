/**
 * Configuration options that control VCS log parsing and analysis behaviour.
 *
 * All numeric thresholds mirror the original code-maat CLI flags and are
 * used by the analysis algorithms to filter out low-signal data.
 */
export interface CliOptions {
  /** Path to the VCS log file to analyse. */
  log?: string;
  /** VCS type: one of `"svn"`, `"git"`, `"git2"`, `"hg"`, `"p4"`, or `"tfs"`. */
  versionControl?: string;
  /** The analysis to run (e.g. `"authors"`, `"coupling"`, `"churn"`). */
  analysis: string;
  /** Character encoding of the log file when it differs from UTF-8. */
  inputEncoding?: string;
  /** Maximum number of result rows to emit. */
  rows?: number;
  /** Path to write the analysis output file. */
  outfile?: string;
  /** Path to a layer-grouping definition file. */
  group?: string;
  /** Path to a CSV file mapping individual authors to teams. */
  teamMapFile?: string;
  /** Minimum number of revisions an entity must have to be included. */
  minRevs: number;
  /** Minimum number of revisions two entities must share to be considered coupled. */
  minSharedRevs: number;
  /** Minimum coupling percentage (0–100) to include a pair in coupling output. */
  minCoupling: number;
  /** Maximum coupling percentage (0–100) to include a pair in coupling output. */
  maxCoupling: number;
  /** Ignore changesets larger than this size when computing coupling. */
  maxChangesetSize: number;
  /** Regex string to match against commit messages. */
  expressionToMatch?: string;
  /** Rolling temporal period for time-based coupling analyses (e.g. `"30"`). */
  temporalPeriod?: string;
  /** Reference date (`YYYY-MM-DD`) used as "now" for code-age analysis. */
  ageTimeNow?: string;
  /** When `true`, analysis output includes additional detail columns. */
  verboseResults: boolean;
  /** When `true`, `parseArgs` was called with `--help` / `-h`. */
  help: boolean;
}

/**
 * The result returned by {@link parseArgs}.
 *
 * `options` always holds a fully-populated `CliOptions` object (defaults
 * filled in).  `errors` is `null` when parsing succeeded, or an array of
 * human-readable error messages when one or more flags were invalid.
 */
export interface ParsedArgs {
  /** Parsed CLI options with defaults applied. */
  options: CliOptions;
  /** Validation errors, or `null` if parsing was clean. */
  errors: string[] | null;
}

const DEFAULT_OPTIONS: CliOptions = {
  analysis: "authors",
  minRevs: 5,
  minSharedRevs: 5,
  minCoupling: 30,
  maxCoupling: 100,
  maxChangesetSize: 30,
  verboseResults: false,
  help: false,
};

const VALID_VCS_TYPES = ["svn", "git", "git2", "hg", "p4", "tfs"];

type ValueFlagHandler = {
  kind: "value";
  apply: (value: string, options: CliOptions, errors: string[], flag: string) => void;
};

type BooleanFlagHandler = {
  kind: "boolean";
  apply: (options: CliOptions) => void;
};

type FlagHandler = ValueFlagHandler | BooleanFlagHandler;

function flattenArgs(args: string[]): string[] {
  const flatArgs: string[] = [];
  for (const arg of args) {
    flatArgs.push(...arg.split(/\s+/).filter((s) => s.length > 0));
  }
  return flatArgs;
}

function validateRequiredOptions(options: CliOptions, errors: string[]): void {
  if (options.help) {
    return;
  }

  if (!options.log) {
    errors.push("Missing required option: --log (path to the VCS log file).");
  }

  if (!options.versionControl) {
    errors.push(
      `Missing required option: --version-control (supported: ${VALID_VCS_TYPES.join(", ")}).`,
    );
  }
}

function parseIntegerValue(flag: string, value: string, errors: string[]): number | undefined {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    errors.push(`Invalid integer for ${flag}: ${value}`);
    return undefined;
  }
  return parsed;
}

function stringFlag(assign: (options: CliOptions, value: string) => void): ValueFlagHandler {
  return {
    kind: "value",
    apply(value, options) {
      assign(options, value);
    },
  };
}

function integerFlag(assign: (options: CliOptions, value: number) => void): ValueFlagHandler {
  return {
    kind: "value",
    apply(value, options, errors, flag) {
      const parsed = parseIntegerValue(flag, value, errors);
      if (parsed !== undefined) {
        assign(options, parsed);
      }
    },
  };
}

function booleanFlag(assign: (options: CliOptions) => void): BooleanFlagHandler {
  return {
    kind: "boolean",
    apply(options) {
      assign(options);
    },
  };
}

const versionControlFlag: ValueFlagHandler = {
  kind: "value",
  apply(value, options, errors) {
    if (!VALID_VCS_TYPES.includes(value)) {
      errors.push(`Unknown VCS type: ${value}. Supported: ${VALID_VCS_TYPES.join(", ")}`);
      return;
    }

    options.versionControl = value;
  },
};

const logFlag = stringFlag((options, value) => {
  options.log = value;
});

const analysisFlag = stringFlag((options, value) => {
  options.analysis = value;
});

const inputEncodingFlag = stringFlag((options, value) => {
  options.inputEncoding = value;
});

const rowsFlag = integerFlag((options, value) => {
  options.rows = value;
});

const outfileFlag = stringFlag((options, value) => {
  options.outfile = value;
});

const groupFlag = stringFlag((options, value) => {
  options.group = value;
});

const teamMapFileFlag = stringFlag((options, value) => {
  options.teamMapFile = value;
});

const minRevsFlag = integerFlag((options, value) => {
  options.minRevs = value;
});

const minSharedRevsFlag = integerFlag((options, value) => {
  options.minSharedRevs = value;
});

const minCouplingFlag = integerFlag((options, value) => {
  options.minCoupling = value;
});

const maxCouplingFlag = integerFlag((options, value) => {
  options.maxCoupling = value;
});

const maxChangesetSizeFlag = integerFlag((options, value) => {
  options.maxChangesetSize = value;
});

const expressionToMatchFlag = stringFlag((options, value) => {
  options.expressionToMatch = value;
});

const temporalPeriodFlag = stringFlag((options, value) => {
  options.temporalPeriod = value;
});

const ageTimeNowFlag = stringFlag((options, value) => {
  options.ageTimeNow = value;
});

const verboseResultsFlag = booleanFlag((options) => {
  options.verboseResults = true;
});

const helpFlag = booleanFlag((options) => {
  options.help = true;
});

const FLAG_HANDLERS: Record<string, FlagHandler> = {
  "-l": logFlag,
  "--log": logFlag,
  "-c": versionControlFlag,
  "--version-control": versionControlFlag,
  "-a": analysisFlag,
  "--analysis": analysisFlag,
  "--input-encoding": inputEncodingFlag,
  "-r": rowsFlag,
  "--rows": rowsFlag,
  "-o": outfileFlag,
  "--outfile": outfileFlag,
  "-g": groupFlag,
  "--group": groupFlag,
  "-p": teamMapFileFlag,
  "--team-map-file": teamMapFileFlag,
  "-n": minRevsFlag,
  "--min-revs": minRevsFlag,
  "-m": minSharedRevsFlag,
  "--min-shared-revs": minSharedRevsFlag,
  "-i": minCouplingFlag,
  "--min-coupling": minCouplingFlag,
  "-x": maxCouplingFlag,
  "--max-coupling": maxCouplingFlag,
  "-s": maxChangesetSizeFlag,
  "--max-changeset-size": maxChangesetSizeFlag,
  "-e": expressionToMatchFlag,
  "--expression-to-match": expressionToMatchFlag,
  "-t": temporalPeriodFlag,
  "--temporal-period": temporalPeriodFlag,
  "-d": ageTimeNowFlag,
  "--age-time-now": ageTimeNowFlag,
  "--verbose-results": verboseResultsFlag,
  "-h": helpFlag,
  "--help": helpFlag,
};

/**
 * Parses a raw array of CLI argument strings into structured {@link CliOptions}.
 *
 * Accepts both short flags (`-l`, `-a`, …) and long flags (`--log`, `--analysis`, …).
 * Individual elements may contain embedded spaces; the function splits them
 * internally so callers can pass either pre-split or unsplit argument strings.
 * Unknown flags are collected as errors rather than thrown.
 *
 * @param args - Raw CLI argument strings, e.g. `["-l", "git.log", "-a", "coupling"]`.
 * @returns A {@link ParsedArgs} object with the resolved options and any
 *   validation errors (`null` when none occurred).
 *
 * @example
 * const { options, errors } = parseArgs(["-l", "git.log", "-c", "git", "-a", "coupling"]);
 * // errors === null
 * // options.log === "git.log"
 * // options.versionControl === "git"
 * // options.analysis === "coupling"
 */
export function parseArgs(args: string[]): ParsedArgs {
  const options: CliOptions = { ...DEFAULT_OPTIONS };
  const errors: string[] = [];

  const flatArgs = flattenArgs(args);

  let i = 0;
  while (i < flatArgs.length) {
    const flag = flatArgs[i];
    if (flag === undefined) break;

    const handler = FLAG_HANDLERS[flag];

    if (!handler) {
      errors.push(`Unknown option: ${flag}`);
      i += 1;
      continue;
    }

    if (handler.kind === "boolean") {
      handler.apply(options);
      i += 1;
      continue;
    }

    const value = flatArgs[i + 1];
    if (value === undefined) {
      errors.push(`Missing value for ${flag}`);
      i += 1;
      continue;
    }

    handler.apply(value, options, errors, flag);
    i += 2;
  }

  validateRequiredOptions(options, errors);

  return {
    options,
    errors: errors.length > 0 ? errors : null,
  };
}

/**
 * Full usage/help text that mirrors the original code-maat CLI help output.
 *
 * Print this string to stdout when `CliOptions.help` is `true`.
 *
 * @example
 * const { options } = parseArgs(process.argv.slice(2));
 * if (options.help) console.log(USAGE);
 */
export const USAGE = `This is Code Maat, a program used to collect statistics from a VCS.
Version: 1.0.5

Usage: program-name -l log-file [options]

Options:
  -l, --log LOG                        Log file with input data
  -c, --version-control VCS            Input vcs module type: supports svn, git, git2, hg, p4, or tfs
  -a, --analysis ANALYSIS              The analysis to run (default: authors)
      --input-encoding INPUT-ENCODING  Specify an encoding other than UTF-8 for the log file
  -r, --rows ROWS                      Max rows in output
  -o, --outfile OUTFILE                Write the result to the given file name
  -g, --group GROUP                    A file with a pre-defined set of layers
  -p, --team-map-file TEAM-MAP-FILE    A CSV file with author,team that translates individuals into teams
  -n, --min-revs MIN-REVS              Minimum number of revisions to include an entity (default: 5)
  -m, --min-shared-revs MIN-SHARED-REVS  Minimum number of shared revisions (default: 5)
  -i, --min-coupling MIN-COUPLING      Minimum degree of coupling in percentage (default: 30)
  -x, --max-coupling MAX-COUPLING      Maximum degree of coupling in percentage (default: 100)
  -s, --max-changeset-size MAX-CHANGESET-SIZE  Maximum changeset size for coupling (default: 30)
  -e, --expression-to-match MATCH-EXPRESSION  A regex to match against commit messages
  -t, --temporal-period TEMPORAL-PERIOD  Rolling temporal period for coupling analyses
  -d, --age-time-now AGE-TIME-NOW      Date as YYYY-MM-dd for code age analysis
      --verbose-results                Includes additional analysis details
  -h, --help                           Show this help

Please refer to the manual page for more information.`;
