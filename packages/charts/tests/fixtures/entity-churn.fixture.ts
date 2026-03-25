import type { EntityChurn } from "@prj-conq/behave";

export const entityChurnFixture: EntityChurn[] = [
  { entity: "src/core/analysis-engine.ts", added: 1820, deleted: 540, commits: 45 },
  { entity: "src/api/routes/upload.ts", added: 1340, deleted: 320, commits: 32 },
  { entity: "src/shared/database/schema.ts", added: 980, deleted: 760, commits: 28 },
  { entity: "src/features/auth/login.ts", added: 760, deleted: 210, commits: 22 },
  { entity: "src/core/event-bus.ts", added: 650, deleted: 180, commits: 18 },
  { entity: "src/api/middleware/auth.ts", added: 540, deleted: 290, commits: 15 },
  { entity: "src/features/dashboard/index.ts", added: 430, deleted: 150, commits: 12 },
  { entity: "src/shared/utils/format.ts", added: 320, deleted: 120, commits: 9 },
];
