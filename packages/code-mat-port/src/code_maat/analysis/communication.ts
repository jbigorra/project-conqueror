import type { VCSEntry } from "../types";
import { asPercentage } from "./math";

export type CommunicationRow = {
  author: string;
  peer: string;
  shared: number;
  average: number;
  strength: number;
};

// Get distinct authors for a list of entries (all touching the same entity)
function authorsOf(entries: VCSEntry[]): string[] {
  return [...new Set(entries.map(e => e.author))];
}

// Generate all 2-element selections with repetition from an array.
// This is equivalent to Clojure's combo/selections with k=2:
// for authors [a, b, c] -> [a,a], [a,b], [a,c], [b,a], [b,b], [b,c], [c,a], [c,b], [c,c]
function selections2<T>(items: T[]): [T, T][] {
  const result: [T, T][] = [];
  for (const a of items) {
    for (const b of items) {
      result.push([a, b]);
    }
  }
  return result;
}

// Group VCS entries by entity
function groupByEntity(entries: VCSEntry[]): Map<string, VCSEntry[]> {
  const groups = new Map<string, VCSEntry[]>();
  for (const entry of entries) {
    const existing = groups.get(entry.entity);
    if (existing) {
      existing.push(entry);
    } else {
      groups.set(entry.entity, [entry]);
    }
  }
  return groups;
}

// Count distinct entities each unique author touched (for self-pairs)
// and count shared entities for cross-author pairs.
// Returns frequency map keyed by "author|peer" string.
function computeFrequencies(entries: VCSEntry[]): Map<string, number> {
  const grouped = groupByEntity(entries);
  const freqs = new Map<string, number>();

  for (const [, entityEntries] of grouped) {
    const authors = authorsOf(entityEntries);
    const pairs = selections2(authors);
    for (const [a, b] of pairs) {
      const key = `${a}\0${b}`;
      freqs.set(key, (freqs.get(key) ?? 0) + 1);
    }
  }

  return freqs;
}

function pairKey(a: string, b: string): string {
  return `${a}\0${b}`;
}

function selfCount(author: string, freqs: Map<string, number>): number {
  return freqs.get(pairKey(author, author)) ?? 0;
}

export function bySharedEntities(entries: VCSEntry[]): CommunicationRow[] {
  const freqs = computeFrequencies(entries);

  const rows: CommunicationRow[] = [];

  for (const [key, shared] of freqs) {
    const [me, peer] = key.split("\0");
    if (me === peer) continue; // skip self-pairs

    const myTotal = selfCount(me!, freqs);
    const peerTotal = selfCount(peer!, freqs);
    const average = Math.ceil((myTotal + peerTotal) / 2);
    const strength = Math.trunc(asPercentage(shared / average));

    rows.push({ author: me!, peer: peer!, shared, average, strength });
  }

  // Sort by strength desc, then author desc, then peer desc
  rows.sort((a, b) => {
    if (b.strength !== a.strength) return b.strength - a.strength;
    if (b.author !== a.author) return b.author > a.author ? 1 : -1;
    if (b.peer !== a.peer) return b.peer > a.peer ? 1 : -1;
    return 0;
  });

  return rows;
}
