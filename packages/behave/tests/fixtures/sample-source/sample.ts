// Sample file with cyclomatic complexity for lizard analysis
export function processInput(value: number, mode: string): string {
  if (mode === "strict") {
    if (value > 100) {
      return "high";
    } else if (value > 50) {
      return "medium";
    } else if (value > 10) {
      return "low";
    } else {
      return "minimal";
    }
  } else if (mode === "lenient") {
    if (value > 50) {
      return "acceptable";
    } else {
      return "ok";
    }
  } else {
    return "unknown";
  }
}

export function classify(items: number[]): string[] {
  const results: string[] = [];
  for (const item of items) {
    if (item < 0) {
      results.push("negative");
    } else if (item === 0) {
      results.push("zero");
    } else {
      results.push("positive");
    }
  }
  return results;
}
