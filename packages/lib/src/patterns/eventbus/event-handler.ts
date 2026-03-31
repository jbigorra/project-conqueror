import type { DomainEvent } from "./domain-event";

export type EventHandlerResult =
  | { success: true; error?: never }
  | { success: false; error: Error };

export interface EventHandler<T extends DomainEvent = DomainEvent> {
  readonly eventType: string;
  readonly handlerName: string;
  handle(event: T): Promise<EventHandlerResult> | EventHandlerResult;
}

export abstract class BaseEventHandler<T extends DomainEvent = DomainEvent>
  implements EventHandler<T>
{
  constructor(
    public readonly eventType: string,
    public readonly handlerName: string,
  ) {}

  abstract handle(event: T): Promise<EventHandlerResult> | EventHandlerResult;

  protected success(): EventHandlerResult {
    return { success: true };
  }

  protected failure(error: Error | string): EventHandlerResult {
    const errorInstance = error instanceof Error ? error : new Error(error);
    return { success: false, error: errorInstance };
  }
}
