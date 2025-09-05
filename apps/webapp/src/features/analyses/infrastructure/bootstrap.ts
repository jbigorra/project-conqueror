import { EventBusInstance } from "#shared/event/event-bus.ts";
import { FileUploadedHandler } from "../application/event-handlers/file-uploaded.handler.ts";

export function registerAnalysesEventHandlers(): void {
  const eventBus = EventBusInstance.get();

  eventBus.subscribe(new FileUploadedHandler());
}
