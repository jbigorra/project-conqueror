import { EventBusInstance } from "#shared/event/event-bus.ts";
import { MainDevAnalysisSubscriber } from "../application/subscribers/main-dev-analysis.subscriber.ts";

export function registerAnalysesEventHandlers(): void {
  const eventBus = EventBusInstance.get();

  eventBus.subscribe(new MainDevAnalysisSubscriber());
}
