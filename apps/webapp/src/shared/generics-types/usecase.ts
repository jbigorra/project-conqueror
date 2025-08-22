import { Result } from "@prj-conq/lib/patterns";

export interface IUseCase<Input, Output> {
  execute(input: Input): Promise<Result<Output>>;
}
