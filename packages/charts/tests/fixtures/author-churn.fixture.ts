import type { AuthorChurn } from "@prj-conq/behave";

export const authorChurnFixture: AuthorChurn[] = [
  { author: "alice@example.com", added: 4820, deleted: 1230, commits: 87 },
  { author: "bob@example.com", added: 3540, deleted: 980, commits: 62 },
  { author: "charlie@example.com", added: 2890, deleted: 1540, commits: 54 },
  { author: "diana@example.com", added: 2150, deleted: 670, commits: 41 },
  { author: "eve@example.com", added: 1760, deleted: 890, commits: 35 },
  { author: "frank@example.com", added: 1230, deleted: 420, commits: 28 },
  { author: "grace@example.com", added: 980, deleted: 310, commits: 22 },
];
