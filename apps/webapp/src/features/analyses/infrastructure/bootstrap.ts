import { EventBusInstance } from "#shared/event/event-bus.ts";
import { AnalysisRunnerSubscriber } from "../application/subscribers/analysis-runner.subscriber.ts";

export function registerAnalysesEventHandlers(): void {
  const eventBus = EventBusInstance.get();

  eventBus.subscribe(AnalysisRunnerSubscriber.create({}));
}
