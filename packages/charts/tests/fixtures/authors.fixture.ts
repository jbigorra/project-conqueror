import type { Author } from "@prj-conq/behave";

export const authorsFixture: Author[] = [
  { entity: "src/core/analysis-engine.ts", nAuthors: 8, nRevs: 142 },
  { entity: "src/api/routes/upload.ts", nAuthors: 5, nRevs: 98 },
  { entity: "src/shared/database/schema.ts", nAuthors: 4, nRevs: 87 },
  { entity: "src/features/auth/login.ts", nAuthors: 6, nRevs: 76 },
  { entity: "src/core/event-bus.ts", nAuthors: 3, nRevs: 65 },
  { entity: "src/api/middleware/auth.ts", nAuthors: 4, nRevs: 54 },
  { entity: "package.json", nAuthors: 7, nRevs: 51 },
  { entity: "src/features/dashboard/index.ts", nAuthors: 5, nRevs: 48 },
  { entity: "src/shared/utils/format.ts", nAuthors: 3, nRevs: 42 },
  { entity: "src/core/config.ts", nAuthors: 2, nRevs: 38 },
];
