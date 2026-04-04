import { complexityHotspots as runComplexityHotspots } from "./analyses/aggregated/complexity-hotspots";
import * as simple from "./analyses/simple";
import type { ComplexityHotspot } from "./pipeline/transform/merge-by-entity";
import type { Analysis } from "./schemas/analysis";
import type {
  AbsChurn, Author, AuthorChurn, CodeAge, Communication, Coupling,
  EntityChurn, EntityEffort, EntityOwnership, Fragmentation,
  MainDev, MainDevByRevs, MessageEntry, RefactoringMainDev,
  Revision, Soc, SummaryEntry,
} from "./schemas/code-maat";
import type { ComplexityHotspotsInput, SimpleAnalysisInput } from "./types";

type SimpleOptions = Omit<SimpleAnalysisInput, "gitLogPath">;
type ComplexityOptions = Omit<ComplexityHotspotsInput, "gitLogPath">;

export class Behave {
  constructor(private readonly gitLogPath: string) {}

  revisions(options?: SimpleOptions): Promise<Analysis<Revision>> {
    return simple.revisions({ gitLogPath: this.gitLogPath, ...options });
  }
  authors(options?: SimpleOptions): Promise<Analysis<Author>> {
    return simple.authors({ gitLogPath: this.gitLogPath, ...options });
  }
  absChurn(options?: SimpleOptions): Promise<Analysis<AbsChurn>> {
    return simple.absChurn({ gitLogPath: this.gitLogPath, ...options });
  }
  authorChurn(options?: SimpleOptions): Promise<Analysis<AuthorChurn>> {
    return simple.authorChurn({ gitLogPath: this.gitLogPath, ...options });
  }
  entityChurn(options?: SimpleOptions): Promise<Analysis<EntityChurn>> {
    return simple.entityChurn({ gitLogPath: this.gitLogPath, ...options });
  }
  entityEffort(options?: SimpleOptions): Promise<Analysis<EntityEffort>> {
    return simple.entityEffort({ gitLogPath: this.gitLogPath, ...options });
  }
  entityOwnership(options?: SimpleOptions): Promise<Analysis<EntityOwnership>> {
    return simple.entityOwnership({ gitLogPath: this.gitLogPath, ...options });
  }
  coupling(options?: SimpleOptions): Promise<Analysis<Coupling>> {
    return simple.coupling({ gitLogPath: this.gitLogPath, ...options });
  }
  soc(options?: SimpleOptions): Promise<Analysis<Soc>> {
    return simple.soc({ gitLogPath: this.gitLogPath, ...options });
  }
  age(options?: SimpleOptions): Promise<Analysis<CodeAge>> {
    return simple.age({ gitLogPath: this.gitLogPath, ...options });
  }
  communication(options?: SimpleOptions): Promise<Analysis<Communication>> {
    return simple.communication({ gitLogPath: this.gitLogPath, ...options });
  }
  fragmentation(options?: SimpleOptions): Promise<Analysis<Fragmentation>> {
    return simple.fragmentation({ gitLogPath: this.gitLogPath, ...options });
  }
  identity(options?: SimpleOptions): Promise<Analysis<unknown>> {
    return simple.identity({ gitLogPath: this.gitLogPath, ...options });
  }
  mainDev(options?: SimpleOptions): Promise<Analysis<MainDev>> {
    return simple.mainDev({ gitLogPath: this.gitLogPath, ...options });
  }
  mainDevByRevs(options?: SimpleOptions): Promise<Analysis<MainDevByRevs>> {
    return simple.mainDevByRevs({ gitLogPath: this.gitLogPath, ...options });
  }
  refactoringMainDev(options?: SimpleOptions): Promise<Analysis<RefactoringMainDev>> {
    return simple.refactoringMainDev({ gitLogPath: this.gitLogPath, ...options });
  }
  messages(options?: SimpleOptions): Promise<Analysis<MessageEntry>> {
    return simple.messages({ gitLogPath: this.gitLogPath, ...options });
  }
  summary(options?: SimpleOptions): Promise<Analysis<SummaryEntry>> {
    return simple.summary({ gitLogPath: this.gitLogPath, ...options });
  }
  complexityHotspots(options: ComplexityOptions): Promise<Analysis<ComplexityHotspot>> {
    return runComplexityHotspots({ gitLogPath: this.gitLogPath, ...options });
  }
}
