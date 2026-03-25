import type { MessageEntry } from "@prj-conq/behave";

export const messagesFixture: MessageEntry[] = [
  { entity: "fix", matches: 87 },
  { entity: "feat", matches: 74 },
  { entity: "refactor", matches: 52 },
  { entity: "chore", matches: 45 },
  { entity: "docs", matches: 38 },
  { entity: "test", matches: 31 },
  { entity: "style", matches: 24 },
  { entity: "perf", matches: 18 },
  { entity: "ci", matches: 12 },
  { entity: "revert", matches: 8 },
];
