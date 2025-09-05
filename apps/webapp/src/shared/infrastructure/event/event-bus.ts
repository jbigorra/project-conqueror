import { EventBus } from "@prj-conq/lib/patterns";

export class EventBusInstance {
  private static instance: EventBus | null = null;

  private constructor() {}

  static get(): EventBus {
    this.instance ??= new EventBus();
    return this.instance;
  }
}
