import { complexityHotspots as runComplexityHotspots } from "./analyses/aggregated/complexity-hotspots";
import * as simple from "./analyses/simple";
import type { ComplexityHotspot } from "./pipeline/transform/merge-by-entity";
import type { Analysis } from "./schemas/analysis";
import type {
  AbsChurn,
  Author,
  AuthorChurn,
  CodeAge,
  Communication,
  Coupling,
  EntityChurn,
  EntityEffort,
  EntityOwnership,
  Fragmentation,
  MainDev,
  MainDevByRevs,
  MessageEntry,
  RefactoringMainDev,
  Revision,
  Soc,
  SummaryEntry,
} from "./schemas/code-maat";
import type { ComplexityHotspotsInput, SimpleAnalysisInput } from "./types";

type SimpleOptions = Omit<SimpleAnalysisInput, "gitLogPath">;
type ComplexityOptions = Omit<ComplexityHotspotsInput, "gitLogPath">;

/**
 * Stateful facade that binds a git log path and exposes all behavioural code analyses.
 *
 * @example
 * ```ts
 * const behave = new Behave("/tmp/project.log");
 * const revs = await behave.revisions();
 * const hotspots = await behave.complexityHotspots({ sourceDir: "/home/user/project/src" });
 * ```
 */
export class Behave {
  /**
   * @param gitLogPath - Absolute path to the git log file used for all analyses.
   */
  constructor(private readonly gitLogPath: string) {}

  /**
   * Counts how many times each file was changed.
   *
   * @param options - Optional analysis thresholds and output format.
   * @returns Analysis with revision counts per entity.
   */
  revisions(options?: SimpleOptions): Promise<Analysis<Revision>> {
    return simple.revisions({ gitLogPath: this.gitLogPath, ...options });
  }

  /**
   * Counts distinct authors and revisions per file.
   *
   * @param options - Optional analysis thresholds and output format.
   * @returns Analysis with author counts per entity.
   */
  authors(options?: SimpleOptions): Promise<Analysis<Author>> {
    return simple.authors({ gitLogPath: this.gitLogPath, ...options });
  }

  /**
   * Shows lines added/deleted and commits per date.
   *
   * @param options - Optional analysis thresholds and output format.
   * @returns Analysis with daily absolute churn metrics.
   */
  absChurn(options?: SimpleOptions): Promise<Analysis<AbsChurn>> {
    return simple.absChurn({ gitLogPath: this.gitLogPath, ...options });
  }

  /**
   * Shows lines added/deleted and commits per author.
   *
   * @param options - Optional analysis thresholds and output format.
   * @returns Analysis with per-author churn metrics.
   */
  authorChurn(options?: SimpleOptions): Promise<Analysis<AuthorChurn>> {
    return simple.authorChurn({ gitLogPath: this.gitLogPath, ...options });
  }

  /**
   * Shows lines added/deleted and commits per file.
   *
   * @param options - Optional analysis thresholds and output format.
   * @returns Analysis with per-entity churn metrics.
   */
  entityChurn(options?: SimpleOptions): Promise<Analysis<EntityChurn>> {
    return simple.entityChurn({ gitLogPath: this.gitLogPath, ...options });
  }

  /**
   * Shows revision distribution per author per file.
   *
   * @param options - Optional analysis thresholds and output format.
   * @returns Analysis with per-author effort per entity.
   */
  entityEffort(options?: SimpleOptions): Promise<Analysis<EntityEffort>> {
    return simple.entityEffort({ gitLogPath: this.gitLogPath, ...options });
  }

  /**
   * Shows lines added/deleted per author per file.
   *
   * @param options - Optional analysis thresholds and output format.
   * @returns Analysis with ownership breakdown per entity.
   */
  entityOwnership(options?: SimpleOptions): Promise<Analysis<EntityOwnership>> {
    return simple.entityOwnership({ gitLogPath: this.gitLogPath, ...options });
  }

  /**
   * Detects files that change together (temporal coupling).
   *
   * @param options - Optional analysis thresholds and output format.
   * @returns Analysis with coupled entity pairs and coupling degrees.
   */
  coupling(options?: SimpleOptions): Promise<Analysis<Coupling>> {
    return simple.coupling({ gitLogPath: this.gitLogPath, ...options });
  }

  /**
   * Measures total coupling per entity (sum-of-coupling).
   *
   * @param options - Optional analysis thresholds and output format.
   * @returns Analysis with sum-of-coupling values per entity.
   */
  soc(options?: SimpleOptions): Promise<Analysis<Soc>> {
    return simple.soc({ gitLogPath: this.gitLogPath, ...options });
  }

  /**
   * Measures how old each file is relative to a reference date.
   *
   * @param options - Must include `ageTimeNow` in "YYYY-MM-DD" format.
   * @returns Analysis with age in months per entity.
   */
  age(options?: SimpleOptions): Promise<Analysis<CodeAge>> {
    return simple.age({ gitLogPath: this.gitLogPath, ...options });
  }

  /**
   * Detects implicit collaboration between authors via shared file changes.
   *
   * @param options - Optional analysis thresholds and output format.
   * @returns Analysis with author-peer communication pairs.
   */
  communication(options?: SimpleOptions): Promise<Analysis<Communication>> {
    return simple.communication({ gitLogPath: this.gitLogPath, ...options });
  }

  /**
   * Measures knowledge distribution across authors per file.
   *
   * @param options - Optional analysis thresholds and output format.
   * @returns Analysis with fractal values per entity.
   */
  fragmentation(options?: SimpleOptions): Promise<Analysis<Fragmentation>> {
    return simple.fragmentation({ gitLogPath: this.gitLogPath, ...options });
  }

  /**
   * Returns raw code-maat records without schema decoding.
   *
   * @param options - Optional analysis thresholds and output format.
   * @returns Analysis with untyped records.
   */
  identity(options?: SimpleOptions): Promise<Analysis<unknown>> {
    return simple.identity({ gitLogPath: this.gitLogPath, ...options });
  }

  /**
   * Identifies the primary author per file by lines added.
   *
   * @param options - Optional analysis thresholds and output format.
   * @returns Analysis with main developer and ownership per entity.
   */
  mainDev(options?: SimpleOptions): Promise<Analysis<MainDev>> {
    return simple.mainDev({ gitLogPath: this.gitLogPath, ...options });
  }

  /**
   * Identifies the primary author per file by commit count.
   *
   * @param options - Optional analysis thresholds and output format.
   * @returns Analysis with main developer and ownership per entity.
   */
  mainDevByRevs(options?: SimpleOptions): Promise<Analysis<MainDevByRevs>> {
    return simple.mainDevByRevs({ gitLogPath: this.gitLogPath, ...options });
  }

  /**
   * Identifies who removes the most code per file (refactoring activity).
   *
   * @param options - Optional analysis thresholds and output format.
   * @returns Analysis with refactoring main developer and ownership per entity.
   */
  refactoringMainDev(options?: SimpleOptions): Promise<Analysis<RefactoringMainDev>> {
    return simple.refactoringMainDev({ gitLogPath: this.gitLogPath, ...options });
  }

  /**
   * Counts commit message matches per entity against a regex.
   *
   * @param options - Must include `expressionToMatch` regex pattern.
   * @returns Analysis with match counts per entity.
   */
  messages(options?: SimpleOptions): Promise<Analysis<MessageEntry>> {
    return simple.messages({ gitLogPath: this.gitLogPath, ...options });
  }

  /**
   * Returns high-level repository statistics.
   *
   * @param options - Optional analysis thresholds and output format.
   * @returns Analysis with statistic name-value pairs.
   */
  summary(options?: SimpleOptions): Promise<Analysis<SummaryEntry>> {
    return simple.summary({ gitLogPath: this.gitLogPath, ...options });
  }

  /**
   * Combines revision frequency with cyclomatic complexity to find hotspots.
   *
   * @param options - Must include `sourceDir` for lizard analysis.
   * @returns Analysis with complexity hotspot records.
   */
  complexityHotspots(options: ComplexityOptions): Promise<Analysis<ComplexityHotspot>> {
    return runComplexityHotspots({ gitLogPath: this.gitLogPath, ...options });
  }
}
