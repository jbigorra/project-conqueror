import type { CodeAge } from "@prj-conq/behave";

export const ageFixture: CodeAge[] = [
  { entity: "src/core/analysis-engine.ts", ageMonths: 2 },
  { entity: "src/api/routes/upload.ts", ageMonths: 3 },
  { entity: "src/shared/database/schema.ts", ageMonths: 5 },
  { entity: "src/features/auth/login.ts", ageMonths: 7 },
  { entity: "src/core/event-bus.ts", ageMonths: 8 },
  { entity: "src/api/middleware/auth.ts", ageMonths: 12 },
  { entity: "package.json", ageMonths: 18 },
  { entity: "src/features/dashboard/index.ts", ageMonths: 4 },
  { entity: "src/shared/utils/format.ts", ageMonths: 11 },
  { entity: "src/core/config.ts", ageMonths: 24 },
  { entity: "tsconfig.json", ageMonths: 30 },
  { entity: "src/shared/constants.ts", ageMonths: 15 },
];
