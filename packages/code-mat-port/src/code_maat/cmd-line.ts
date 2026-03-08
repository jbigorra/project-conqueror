export interface CliOptions {
  log?: string;
  versionControl?: string;
  analysis: string;
  inputEncoding?: string;
  rows?: number;
  outfile?: string;
  group?: string;
  teamMapFile?: string;
  minRevs: number;
  minSharedRevs: number;
  minCoupling: number;
  maxCoupling: number;
  maxChangesetSize: number;
  expressionToMatch?: string;
  temporalPeriod?: string;
  ageTimeNow?: string;
  verboseResults: boolean;
  help: boolean;
}

export interface ParsedArgs {
  options: CliOptions;
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

export function parseArgs(args: string[]): ParsedArgs {
  const options: CliOptions = { ...DEFAULT_OPTIONS };
  const errors: string[] = [];

  // Flatten args that may contain spaces (e.g. ["-l some_file.log"] -> ["-l", "some_file.log"])
  const flatArgs: string[] = [];
  for (const arg of args) {
    flatArgs.push(...arg.split(/\s+/).filter((s) => s.length > 0));
  }

  let i = 0;
  while (i < flatArgs.length) {
    const flag = flatArgs[i];

    switch (flag) {
      case "-l":
      case "--log": {
        const val = flatArgs[++i];
        if (val === undefined) {
          errors.push(`Missing value for ${flag}`);
        } else {
          options.log = val;
        }
        break;
      }
      case "-c":
      case "--version-control": {
        const val = flatArgs[++i];
        if (val === undefined) {
          errors.push(`Missing value for ${flag}`);
        } else {
          const valid = ["svn", "git", "git2", "hg", "p4", "tfs"];
          if (!valid.includes(val)) {
            errors.push(`Unknown VCS type: ${val}. Supported: ${valid.join(", ")}`);
          } else {
            options.versionControl = val;
          }
        }
        break;
      }
      case "-a":
      case "--analysis": {
        const val = flatArgs[++i];
        if (val === undefined) {
          errors.push(`Missing value for ${flag}`);
        } else {
          options.analysis = val;
        }
        break;
      }
      case "--input-encoding": {
        const val = flatArgs[++i];
        if (val === undefined) {
          errors.push(`Missing value for ${flag}`);
        } else {
          options.inputEncoding = val;
        }
        break;
      }
      case "-r":
      case "--rows": {
        const val = flatArgs[++i];
        if (val === undefined) {
          errors.push(`Missing value for ${flag}`);
        } else {
          const num = parseInt(val, 10);
          if (Number.isNaN(num)) {
            errors.push(`Invalid integer for ${flag}: ${val}`);
          } else {
            options.rows = num;
          }
        }
        break;
      }
      case "-o":
      case "--outfile": {
        const val = flatArgs[++i];
        if (val === undefined) {
          errors.push(`Missing value for ${flag}`);
        } else {
          options.outfile = val;
        }
        break;
      }
      case "-g":
      case "--group": {
        const val = flatArgs[++i];
        if (val === undefined) {
          errors.push(`Missing value for ${flag}`);
        } else {
          options.group = val;
        }
        break;
      }
      case "-p":
      case "--team-map-file": {
        const val = flatArgs[++i];
        if (val === undefined) {
          errors.push(`Missing value for ${flag}`);
        } else {
          options.teamMapFile = val;
        }
        break;
      }
      case "-n":
      case "--min-revs": {
        const val = flatArgs[++i];
        if (val === undefined) {
          errors.push(`Missing value for ${flag}`);
        } else {
          const num = parseInt(val, 10);
          if (Number.isNaN(num)) {
            errors.push(`Invalid integer for ${flag}: ${val}`);
          } else {
            options.minRevs = num;
          }
        }
        break;
      }
      case "-m":
      case "--min-shared-revs": {
        const val = flatArgs[++i];
        if (val === undefined) {
          errors.push(`Missing value for ${flag}`);
        } else {
          const num = parseInt(val, 10);
          if (Number.isNaN(num)) {
            errors.push(`Invalid integer for ${flag}: ${val}`);
          } else {
            options.minSharedRevs = num;
          }
        }
        break;
      }
      case "-i":
      case "--min-coupling": {
        const val = flatArgs[++i];
        if (val === undefined) {
          errors.push(`Missing value for ${flag}`);
        } else {
          const num = parseInt(val, 10);
          if (Number.isNaN(num)) {
            errors.push(`Invalid integer for ${flag}: ${val}`);
          } else {
            options.minCoupling = num;
          }
        }
        break;
      }
      case "-x":
      case "--max-coupling": {
        const val = flatArgs[++i];
        if (val === undefined) {
          errors.push(`Missing value for ${flag}`);
        } else {
          const num = parseInt(val, 10);
          if (Number.isNaN(num)) {
            errors.push(`Invalid integer for ${flag}: ${val}`);
          } else {
            options.maxCoupling = num;
          }
        }
        break;
      }
      case "-s":
      case "--max-changeset-size": {
        const val = flatArgs[++i];
        if (val === undefined) {
          errors.push(`Missing value for ${flag}`);
        } else {
          const num = parseInt(val, 10);
          if (Number.isNaN(num)) {
            errors.push(`Invalid integer for ${flag}: ${val}`);
          } else {
            options.maxChangesetSize = num;
          }
        }
        break;
      }
      case "-e":
      case "--expression-to-match": {
        const val = flatArgs[++i];
        if (val === undefined) {
          errors.push(`Missing value for ${flag}`);
        } else {
          options.expressionToMatch = val;
        }
        break;
      }
      case "-t":
      case "--temporal-period": {
        const val = flatArgs[++i];
        if (val === undefined) {
          errors.push(`Missing value for ${flag}`);
        } else {
          options.temporalPeriod = val;
        }
        break;
      }
      case "-d":
      case "--age-time-now": {
        const val = flatArgs[++i];
        if (val === undefined) {
          errors.push(`Missing value for ${flag}`);
        } else {
          options.ageTimeNow = val;
        }
        break;
      }
      case "--verbose-results": {
        options.verboseResults = true;
        break;
      }
      case "-h":
      case "--help": {
        options.help = true;
        break;
      }
      default: {
        errors.push(`Unknown option: ${flag}`);
        break;
      }
    }

    i++;
  }

  return {
    options,
    errors: errors.length > 0 ? errors : null,
  };
}

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
