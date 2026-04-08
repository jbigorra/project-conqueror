import { spawn } from "node:child_process";
import { spawnAsync } from "@prj-conq/lib/processes";
import { LizardExecutor } from "#lizard/ts-lizard/infrastructure/lizard-executor.ts";
import { Lizard } from "#lizard/ts-lizard/wrapper.ts";

/**
 * Singleton factory for the {@link Lizard} complexity analyzer.
 *
 * Lazily creates and caches a fully-wired `Lizard` instance backed by the
 * vendored Python lizard subprocess.
 *
 * @example
 * ```ts
 * import { LizardInstance } from "@prj-conq/lizard-ts";
 *
 * const lizard = LizardInstance.create();
 * const csv = await lizard.analyze("src/");
 * ```
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Simple singleton pattern
export class LizardInstance {
  private static instance: Lizard | null = null;

  /**
   * Returns the shared {@link Lizard} instance, creating it on first call.
   *
   * @returns A fully-wired Lizard instance ready for analysis
   */
  static create(): Lizard {
    LizardInstance.instance ??= new Lizard(new LizardExecutor(spawnAsync({ spawn })));
    return LizardInstance.instance;
  }
}

export { Lizard };
