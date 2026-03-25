import type { ComplexityHotspot } from "@prj-conq/behave";

export const hotspotsFixture: ComplexityHotspot[] = [
  { entity: "src/core/analysis-engine.ts", nRevs: 142, cyclomaticComplexity: 38 },
  { entity: "src/api/routes/upload.ts", nRevs: 98, cyclomaticComplexity: 24 },
  { entity: "src/shared/database/schema.ts", nRevs: 87, cyclomaticComplexity: 18 },
  { entity: "src/features/auth/login.ts", nRevs: 76, cyclomaticComplexity: 22 },
  { entity: "src/core/event-bus.ts", nRevs: 65, cyclomaticComplexity: 15 },
  { entity: "src/api/middleware/auth.ts", nRevs: 54, cyclomaticComplexity: 19 },
  { entity: "src/features/dashboard/index.ts", nRevs: 48, cyclomaticComplexity: 12 },
  { entity: "src/shared/utils/format.ts", nRevs: 42, cyclomaticComplexity: 9 },
  { entity: "src/core/config.ts", nRevs: 38, cyclomaticComplexity: 7 },
  { entity: "src/features/reports/generator.ts", nRevs: 31, cyclomaticComplexity: 28 },
];
