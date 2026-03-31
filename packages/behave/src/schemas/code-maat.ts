import { Schema } from "effect";

// revisions
export const RevisionsSchema = Schema.Array(
  Schema.Struct({ entity: Schema.String, nRevs: Schema.Number }),
);
export type Revision = { entity: string; nRevs: number };

// authors
export const AuthorsSchema = Schema.Array(
  Schema.Struct({
    entity: Schema.String,
    nAuthors: Schema.Number,
    nRevs: Schema.Number,
  }),
);
export type Author = { entity: string; nAuthors: number; nRevs: number };

// coupling
export const CouplingSchema = Schema.Array(
  Schema.Struct({
    entity: Schema.String,
    coupled: Schema.String,
    degree: Schema.Number,
    averageRevs: Schema.Number,
  }),
);
export type Coupling = {
  entity: string;
  coupled: string;
  degree: number;
  averageRevs: number;
};

// soc
export const SocSchema = Schema.Array(Schema.Struct({ entity: Schema.String, soc: Schema.Number }));
export type Soc = { entity: string; soc: number };

// summary
export const SummarySchema = Schema.Array(
  Schema.Struct({ statistic: Schema.String, value: Schema.Number }),
);
export type SummaryEntry = { statistic: string; value: number };

// identity (passthrough)
export const IdentitySchema = Schema.Array(Schema.Unknown);

// abs-churn
export const AbsChurnSchema = Schema.Array(
  Schema.Struct({
    date: Schema.String,
    added: Schema.Number,
    deleted: Schema.Number,
    commits: Schema.Number,
  }),
);
export type AbsChurn = {
  date: string;
  added: number;
  deleted: number;
  commits: number;
};

// author-churn
export const AuthorChurnSchema = Schema.Array(
  Schema.Struct({
    author: Schema.String,
    added: Schema.Number,
    deleted: Schema.Number,
    commits: Schema.Number,
  }),
);
export type AuthorChurn = {
  author: string;
  added: number;
  deleted: number;
  commits: number;
};

// entity-churn
export const EntityChurnSchema = Schema.Array(
  Schema.Struct({
    entity: Schema.String,
    added: Schema.Number,
    deleted: Schema.Number,
    commits: Schema.Number,
  }),
);
export type EntityChurn = {
  entity: string;
  added: number;
  deleted: number;
  commits: number;
};

// entity-ownership
export const EntityOwnershipSchema = Schema.Array(
  Schema.Struct({
    entity: Schema.String,
    author: Schema.String,
    added: Schema.Number,
    deleted: Schema.Number,
  }),
);
export type EntityOwnership = {
  entity: string;
  author: string;
  added: number;
  deleted: number;
};

// main-dev
export const MainDevSchema = Schema.Array(
  Schema.Struct({
    entity: Schema.String,
    mainDev: Schema.String,
    added: Schema.Number,
    totalAdded: Schema.Number,
    ownership: Schema.Number,
  }),
);
export type MainDev = {
  entity: string;
  mainDev: string;
  added: number;
  totalAdded: number;
  ownership: number;
};

// refactoring-main-dev
export const RefactoringMainDevSchema = Schema.Array(
  Schema.Struct({
    entity: Schema.String,
    mainDev: Schema.String,
    removed: Schema.Number,
    totalRemoved: Schema.Number,
    ownership: Schema.Number,
  }),
);
export type RefactoringMainDev = {
  entity: string;
  mainDev: string;
  removed: number;
  totalRemoved: number;
  ownership: number;
};

// entity-effort
export const EntityEffortSchema = Schema.Array(
  Schema.Struct({
    entity: Schema.String,
    author: Schema.String,
    authorRevs: Schema.Number,
    totalRevs: Schema.Number,
  }),
);
export type EntityEffort = {
  entity: string;
  author: string;
  authorRevs: number;
  totalRevs: number;
};

// main-dev-by-revs (same shape as main-dev)
export const MainDevByRevsSchema = MainDevSchema;
export type MainDevByRevs = MainDev;

// fragmentation
export const FragmentationSchema = Schema.Array(
  Schema.Struct({
    entity: Schema.String,
    fractalValue: Schema.Number,
    totalRevs: Schema.Number,
  }),
);
export type Fragmentation = {
  entity: string;
  fractalValue: number;
  totalRevs: number;
};

// communication
export const CommunicationSchema = Schema.Array(
  Schema.Struct({
    author: Schema.String,
    peer: Schema.String,
    shared: Schema.Number,
    average: Schema.Number,
    strength: Schema.Number,
  }),
);
export type Communication = {
  author: string;
  peer: string;
  shared: number;
  average: number;
  strength: number;
};

// messages
export const MessagesSchema = Schema.Array(
  Schema.Struct({ entity: Schema.String, matches: Schema.Number }),
);
export type MessageEntry = { entity: string; matches: number };

// age
export const AgeSchema = Schema.Array(
  Schema.Struct({ entity: Schema.String, ageMonths: Schema.Number }),
);
export type CodeAge = { entity: string; ageMonths: number };
