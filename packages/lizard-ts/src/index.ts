import { spawn } from "node:child_process";
import { spawnAsync } from "@prj-conq/lib/processes";
import { LizardExecutor } from "#lizard/ts-lizard/infrastructure/lizard-executor.ts";
import { Lizard } from "#lizard/ts-lizard/wrapper.ts";

// biome-ignore lint/complexity/noStaticOnlyClass: Simple singleton pattern
export class LizardInstance {
  private static instance: Lizard | null = null;

  static create(): Lizard {
    LizardInstance.instance ??= new Lizard(new LizardExecutor(spawnAsync({ spawn })));
    return LizardInstance.instance;
  }
}

export { Lizard };
