import { Schema } from "effect";

// --- revisions ---

/** Effect Schema for decoding revisions analysis output. */
export const RevisionsSchema = Schema.Array(
  Schema.Struct({ entity: Schema.String, nRevs: Schema.Number }),
);
/** A file entity with its total number of revisions. */
export type Revision = { entity: string; nRevs: number };

// --- authors ---

/** Effect Schema for decoding authors analysis output. */
export const AuthorsSchema = Schema.Array(
  Schema.Struct({
    entity: Schema.String,
    nAuthors: Schema.Number,
    nRevs: Schema.Number,
  }),
);
/** A file entity with the number of distinct authors and revisions. */
export type Author = { entity: string; nAuthors: number; nRevs: number };

// --- coupling ---

/** Effect Schema for decoding temporal coupling analysis output. */
export const CouplingSchema = Schema.Array(
  Schema.Struct({
    entity: Schema.String,
    coupled: Schema.String,
    degree: Schema.Number,
    averageRevs: Schema.Number,
  }),
);
/** A pair of entities that change together, with coupling degree and average revisions. */
export type Coupling = {
  entity: string;
  /** The other entity this one is coupled with. */
  coupled: string;
  /** Coupling percentage (0-100). */
  degree: number;
  averageRevs: number;
};

// --- soc ---

/** Effect Schema for decoding sum-of-coupling analysis output. */
export const SocSchema = Schema.Array(Schema.Struct({ entity: Schema.String, soc: Schema.Number }));
/** A file entity with its sum-of-coupling value. */
export type Soc = { entity: string; soc: number };

// --- summary ---

/** Effect Schema for decoding summary analysis output. */
export const SummarySchema = Schema.Array(
  Schema.Struct({ statistic: Schema.String, value: Schema.Number }),
);
/** A single statistic from the repository summary (e.g. "number-of-commits"). */
export type SummaryEntry = { statistic: string; value: number };

// --- identity (passthrough) ---

/** Effect Schema for identity analysis; passes through raw records untyped. */
export const IdentitySchema = Schema.Array(Schema.Unknown);

// --- abs-churn ---

/** Effect Schema for decoding absolute churn analysis output. */
export const AbsChurnSchema = Schema.Array(
  Schema.Struct({
    date: Schema.String,
    added: Schema.Number,
    deleted: Schema.Number,
    commits: Schema.Number,
  }),
);
/** Absolute code churn (lines added/deleted and commits) for a single date. */
export type AbsChurn = {
  date: string;
  added: number;
  deleted: number;
  commits: number;
};

// --- author-churn ---

/** Effect Schema for decoding author churn analysis output. */
export const AuthorChurnSchema = Schema.Array(
  Schema.Struct({
    author: Schema.String,
    added: Schema.Number,
    deleted: Schema.Number,
    commits: Schema.Number,
  }),
);
/** Code churn (lines added/deleted and commits) aggregated per author. */
export type AuthorChurn = {
  author: string;
  added: number;
  deleted: number;
  commits: number;
};

// --- entity-churn ---

/** Effect Schema for decoding entity churn analysis output. */
export const EntityChurnSchema = Schema.Array(
  Schema.Struct({
    entity: Schema.String,
    added: Schema.Number,
    deleted: Schema.Number,
    commits: Schema.Number,
  }),
);
/** Code churn (lines added/deleted and commits) aggregated per file entity. */
export type EntityChurn = {
  entity: string;
  added: number;
  deleted: number;
  commits: number;
};

// --- entity-ownership ---

/** Effect Schema for decoding entity ownership analysis output. */
export const EntityOwnershipSchema = Schema.Array(
  Schema.Struct({
    entity: Schema.String,
    author: Schema.String,
    added: Schema.Number,
    deleted: Schema.Number,
  }),
);
/** Lines added/deleted by a specific author for a given entity. */
export type EntityOwnership = {
  entity: string;
  author: string;
  added: number;
  deleted: number;
};

// --- main-dev ---

/** Effect Schema for decoding main-developer analysis output. */
export const MainDevSchema = Schema.Array(
  Schema.Struct({
    entity: Schema.String,
    mainDev: Schema.String,
    added: Schema.Number,
    totalAdded: Schema.Number,
    ownership: Schema.Number,
  }),
);
/** The main developer of an entity based on lines added, with ownership percentage. */
export type MainDev = {
  entity: string;
  /** Author with the most lines added. */
  mainDev: string;
  /** Lines added by the main developer. */
  added: number;
  /** Total lines added across all authors. */
  totalAdded: number;
  /** Ownership fraction (0-1). */
  ownership: number;
};

// --- refactoring-main-dev ---

/** Effect Schema for decoding refactoring main-developer analysis output. */
export const RefactoringMainDevSchema = Schema.Array(
  Schema.Struct({
    entity: Schema.String,
    mainDev: Schema.String,
    removed: Schema.Number,
    totalRemoved: Schema.Number,
    ownership: Schema.Number,
  }),
);
/** The main developer of an entity based on lines removed (refactoring activity). */
export type RefactoringMainDev = {
  entity: string;
  /** Author with the most lines removed. */
  mainDev: string;
  /** Lines removed by the main developer. */
  removed: number;
  /** Total lines removed across all authors. */
  totalRemoved: number;
  /** Ownership fraction (0-1). */
  ownership: number;
};

// --- entity-effort ---

/** Effect Schema for decoding entity effort analysis output. */
export const EntityEffortSchema = Schema.Array(
  Schema.Struct({
    entity: Schema.String,
    author: Schema.String,
    authorRevs: Schema.Number,
    totalRevs: Schema.Number,
  }),
);
/** Effort distribution: how many revisions an author contributed to an entity. */
export type EntityEffort = {
  entity: string;
  author: string;
  /** Number of revisions by this author. */
  authorRevs: number;
  /** Total revisions across all authors. */
  totalRevs: number;
};

// --- main-dev-by-revs ---

/** Effect Schema for main-developer-by-revisions (same shape as MainDevSchema). */
export const MainDevByRevsSchema = MainDevSchema;
/** Main developer determined by revision count rather than lines added. */
export type MainDevByRevs = MainDev;

// --- fragmentation ---

/** Effect Schema for decoding fragmentation analysis output. */
export const FragmentationSchema = Schema.Array(
  Schema.Struct({
    entity: Schema.String,
    fractalValue: Schema.Number,
    totalRevs: Schema.Number,
  }),
);
/** Knowledge fragmentation for an entity (0 = single author, 1 = maximally fragmented). */
export type Fragmentation = {
  entity: string;
  /** Fractal value between 0 and 1. */
  fractalValue: number;
  totalRevs: number;
};

// --- communication ---

/** Effect Schema for decoding communication analysis output. */
export const CommunicationSchema = Schema.Array(
  Schema.Struct({
    author: Schema.String,
    peer: Schema.String,
    shared: Schema.Number,
    average: Schema.Number,
    strength: Schema.Number,
  }),
);
/** Communication link between two authors based on shared file changes. */
export type Communication = {
  author: string;
  /** The other author in this communication pair. */
  peer: string;
  /** Number of shared entities. */
  shared: number;
  /** Average shared revisions. */
  average: number;
  /** Communication strength metric. */
  strength: number;
};

// --- messages ---

/** Effect Schema for decoding commit messages analysis output. */
export const MessagesSchema = Schema.Array(
  Schema.Struct({ entity: Schema.String, matches: Schema.Number }),
);
/** Number of commit message matches for an entity against the given regex. */
export type MessageEntry = { entity: string; matches: number };

// --- age ---

/** Effect Schema for decoding code age analysis output. */
export const AgeSchema = Schema.Array(
  Schema.Struct({ entity: Schema.String, ageMonths: Schema.Number }),
);
/** Age of a file entity in months since the reference date. */
export type CodeAge = { entity: string; ageMonths: number };
