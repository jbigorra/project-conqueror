import type { Soc } from "@prj-conq/behave";

export const socFixture: Soc[] = [
  { entity: "src/core/analysis-engine.ts", soc: 24 },
  { entity: "src/api/routes/upload.ts", soc: 18 },
  { entity: "src/shared/database/schema.ts", soc: 15 },
  { entity: "src/features/auth/login.ts", soc: 12 },
  { entity: "src/core/event-bus.ts", soc: 11 },
  { entity: "src/api/middleware/auth.ts", soc: 9 },
  { entity: "package.json", soc: 7 },
  { entity: "src/features/dashboard/index.ts", soc: 6 },
  { entity: "src/shared/utils/format.ts", soc: 5 },
  { entity: "src/core/config.ts", soc: 3 },
];
