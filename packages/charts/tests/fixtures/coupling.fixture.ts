import type { Coupling } from "@prj-conq/behave";

export const couplingFixture: Coupling[] = [
  {
    entity: "src/core/analysis-engine.ts",
    coupled: "src/api/routes/upload.ts",
    degree: 78,
    averageRevs: 120,
  },
  {
    entity: "src/features/auth/login.ts",
    coupled: "src/features/auth/register.ts",
    degree: 65,
    averageRevs: 47,
  },
  {
    entity: "src/shared/database/schema.ts",
    coupled: "src/shared/database/migrations.ts",
    degree: 60,
    averageRevs: 55,
  },
  {
    entity: "src/core/event-bus.ts",
    coupled: "src/core/analysis-engine.ts",
    degree: 55,
    averageRevs: 103,
  },
  {
    entity: "src/api/routes/analysis.ts",
    coupled: "src/core/analysis-engine.ts",
    degree: 50,
    averageRevs: 85,
  },
  {
    entity: "src/features/dashboard/index.ts",
    coupled: "src/api/routes/analysis.ts",
    degree: 44,
    averageRevs: 38,
  },
  {
    entity: "src/api/middleware/auth.ts",
    coupled: "src/features/auth/login.ts",
    degree: 39,
    averageRevs: 65,
  },
  {
    entity: "src/shared/utils/format.ts",
    coupled: "src/features/dashboard/index.ts",
    degree: 33,
    averageRevs: 45,
  },
];
