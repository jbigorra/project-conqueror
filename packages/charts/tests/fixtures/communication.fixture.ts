import type { Communication } from "@prj-conq/behave";

export const communicationFixture: Communication[] = [
  {
    author: "alice@example.com",
    peer: "bob@example.com",
    shared: 48,
    average: 14.2,
    strength: 0.78,
  },
  {
    author: "alice@example.com",
    peer: "charlie@example.com",
    shared: 35,
    average: 10.8,
    strength: 0.65,
  },
  {
    author: "bob@example.com",
    peer: "charlie@example.com",
    shared: 29,
    average: 9.1,
    strength: 0.57,
  },
  {
    author: "diana@example.com",
    peer: "alice@example.com",
    shared: 22,
    average: 7.4,
    strength: 0.48,
  },
  {
    author: "bob@example.com",
    peer: "diana@example.com",
    shared: 18,
    average: 6.2,
    strength: 0.41,
  },
  {
    author: "eve@example.com",
    peer: "alice@example.com",
    shared: 15,
    average: 5.8,
    strength: 0.35,
  },
  {
    author: "charlie@example.com",
    peer: "frank@example.com",
    shared: 12,
    average: 4.9,
    strength: 0.29,
  },
  {
    author: "frank@example.com",
    peer: "grace@example.com",
    shared: 9,
    average: 3.7,
    strength: 0.22,
  },
];
