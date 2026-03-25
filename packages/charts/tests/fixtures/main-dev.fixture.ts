import type { MainDev } from "@prj-conq/behave";

export const mainDevFixture: MainDev[] = [
  { entity: "src/core/analysis-engine.ts", mainDev: "alice@example.com", added: 890, totalAdded: 1820, ownership: 0.489 },
  { entity: "src/api/routes/upload.ts", mainDev: "alice@example.com", added: 650, totalAdded: 1080, ownership: 0.602 },
  { entity: "src/shared/database/schema.ts", mainDev: "bob@example.com", added: 540, totalAdded: 820, ownership: 0.659 },
  { entity: "src/features/auth/login.ts", mainDev: "charlie@example.com", added: 420, totalAdded: 760, ownership: 0.553 },
  { entity: "src/core/event-bus.ts", mainDev: "alice@example.com", added: 380, totalAdded: 650, ownership: 0.585 },
  { entity: "src/api/middleware/auth.ts", mainDev: "diana@example.com", added: 310, totalAdded: 540, ownership: 0.574 },
  { entity: "src/features/dashboard/index.ts", mainDev: "bob@example.com", added: 280, totalAdded: 430, ownership: 0.651 },
  { entity: "src/shared/utils/format.ts", mainDev: "eve@example.com", added: 200, totalAdded: 320, ownership: 0.625 },
];
