import type { EntityOwnership } from "@prj-conq/behave";

export const entityOwnershipFixture: EntityOwnership[] = [
  { entity: "src/core/analysis-engine.ts", author: "alice@example.com", added: 890, deleted: 210 },
  { entity: "src/core/analysis-engine.ts", author: "bob@example.com", added: 540, deleted: 120 },
  { entity: "src/core/analysis-engine.ts", author: "charlie@example.com", added: 390, deleted: 85 },
  { entity: "src/api/routes/upload.ts", author: "alice@example.com", added: 650, deleted: 180 },
  { entity: "src/api/routes/upload.ts", author: "diana@example.com", added: 430, deleted: 95 },
  { entity: "src/shared/database/schema.ts", author: "bob@example.com", added: 540, deleted: 320 },
  { entity: "src/shared/database/schema.ts", author: "eve@example.com", added: 280, deleted: 140 },
  { entity: "src/features/auth/login.ts", author: "charlie@example.com", added: 420, deleted: 110 },
  { entity: "src/features/auth/login.ts", author: "frank@example.com", added: 340, deleted: 100 },
];
