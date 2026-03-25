import type { RefactoringMainDev } from "@prj-conq/behave";

export const refactoringMainDevFixture: RefactoringMainDev[] = [
  { entity: "src/core/analysis-engine.ts", mainDev: "bob@example.com", removed: 540, totalRemoved: 980, ownership: 0.551 },
  { entity: "src/api/routes/upload.ts", mainDev: "alice@example.com", removed: 320, totalRemoved: 540, ownership: 0.593 },
  { entity: "src/shared/database/schema.ts", mainDev: "charlie@example.com", removed: 760, totalRemoved: 1200, ownership: 0.633 },
  { entity: "src/features/auth/login.ts", mainDev: "diana@example.com", removed: 210, totalRemoved: 380, ownership: 0.553 },
  { entity: "src/core/event-bus.ts", mainDev: "alice@example.com", removed: 180, totalRemoved: 310, ownership: 0.581 },
  { entity: "src/api/middleware/auth.ts", mainDev: "frank@example.com", removed: 290, totalRemoved: 450, ownership: 0.644 },
  { entity: "src/features/dashboard/index.ts", mainDev: "eve@example.com", removed: 150, totalRemoved: 260, ownership: 0.577 },
];
