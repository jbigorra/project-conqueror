import type { Fragmentation } from "@prj-conq/behave";

export const fragmentationFixture: Fragmentation[] = [
  { entity: "src/core/analysis-engine.ts", fractalValue: 0.82, totalRevs: 142 },
  { entity: "src/api/routes/upload.ts", fractalValue: 0.74, totalRevs: 98 },
  { entity: "src/shared/database/schema.ts", fractalValue: 0.68, totalRevs: 87 },
  { entity: "src/features/auth/login.ts", fractalValue: 0.61, totalRevs: 76 },
  { entity: "src/core/event-bus.ts", fractalValue: 0.53, totalRevs: 65 },
  { entity: "src/api/middleware/auth.ts", fractalValue: 0.45, totalRevs: 54 },
  { entity: "src/features/dashboard/index.ts", fractalValue: 0.38, totalRevs: 48 },
  { entity: "src/shared/utils/format.ts", fractalValue: 0.29, totalRevs: 42 },
  { entity: "src/core/config.ts", fractalValue: 0.21, totalRevs: 38 },
];
