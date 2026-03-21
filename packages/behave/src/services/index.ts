import { Layer } from "effect";
import { CodeMaatLive } from "./code-maat";
import { LizardLive } from "./lizard";

export { CodeMaatLive, CodeMaatService } from "./code-maat";
export { LizardLive, LizardService } from "./lizard";

export const BehaveLive = Layer.merge(CodeMaatLive, LizardLive);
