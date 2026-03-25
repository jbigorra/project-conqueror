import type { EntityEffort } from "@prj-conq/behave";

export const entityEffortFixture: EntityEffort[] = [
  {
    entity: "src/core/analysis-engine.ts",
    author: "alice@example.com",
    authorRevs: 62,
    totalRevs: 142,
  },
  {
    entity: "src/core/analysis-engine.ts",
    author: "bob@example.com",
    authorRevs: 45,
    totalRevs: 142,
  },
  {
    entity: "src/core/analysis-engine.ts",
    author: "charlie@example.com",
    authorRevs: 35,
    totalRevs: 142,
  },
  {
    entity: "src/api/routes/upload.ts",
    author: "alice@example.com",
    authorRevs: 54,
    totalRevs: 98,
  },
  {
    entity: "src/api/routes/upload.ts",
    author: "diana@example.com",
    authorRevs: 44,
    totalRevs: 98,
  },
  {
    entity: "src/shared/database/schema.ts",
    author: "bob@example.com",
    authorRevs: 52,
    totalRevs: 87,
  },
  {
    entity: "src/shared/database/schema.ts",
    author: "eve@example.com",
    authorRevs: 35,
    totalRevs: 87,
  },
  {
    entity: "src/features/auth/login.ts",
    author: "charlie@example.com",
    authorRevs: 48,
    totalRevs: 76,
  },
];
