import { FileUploadedHandler } from "#analyses/application/event-handlers/file-uploaded.handler.ts";
import { EventBus } from "@prj-conq/lib/patterns";

export class EventBusInstance {
  private static instance: EventBus | null = null;

  private constructor() {}

  static get(): EventBus {
    this.instance ??= new EventBus();
    return this.instance;
  }
}

const instance = EventBusInstance.get();
instance.subscribe(new FileUploadedHandler());
