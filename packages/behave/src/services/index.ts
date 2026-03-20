import { Layer } from "effect"
import { CodeMaatLive } from "./code-maat"
import { LizardLive } from "./lizard"

export { CodeMaatService, CodeMaatLive } from "./code-maat"
export { LizardService, LizardLive } from "./lizard"

export const BehaveLive = Layer.merge(CodeMaatLive, LizardLive)
