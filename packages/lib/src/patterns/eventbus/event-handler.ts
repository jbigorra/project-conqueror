import type { DomainEvent } from "./domain-event";

/**
 * Discriminated union representing the outcome of handling a domain event.
 *
 * @example
 * ```ts
 * import type { EventHandlerResult } from "@prj-conq/lib/patterns";
 *
 * const ok: EventHandlerResult = { success: true };
 * const fail: EventHandlerResult = { success: false, error: new Error("timeout") };
 * ```
 */
export type EventHandlerResult =
  | { success: true; error?: never }
  | { success: false; error: Error };

/**
 * Contract for event handlers that subscribe to domain events via the EventBus.
 *
 * @example
 * ```ts
 * import type { EventHandler, DomainEvent } from "@prj-conq/lib/patterns";
 *
 * const handler: EventHandler = {
 *   eventType: "FileUploaded",
 *   handlerName: "RunAnalysis",
 *   handle: async (event) => ({ success: true }),
 * };
 * ```
 */
export interface EventHandler<T extends DomainEvent = DomainEvent> {
  /** The event type this handler subscribes to */
  readonly eventType: string;
  /** Unique name used to prevent duplicate registration */
  readonly handlerName: string;
  /**
   * Processes a domain event.
   *
   * @param event - The domain event to handle
   * @returns The handler result, either synchronously or as a Promise
   */
  handle(event: T): Promise<EventHandlerResult> | EventHandlerResult;
}

/**
 * Abstract base class for event handlers with convenience success/failure helpers.
 *
 * @example
 * ```ts
 * import { BaseEventHandler } from "@prj-conq/lib/patterns";
 * import type { DomainEvent } from "@prj-conq/lib/patterns";
 *
 * class AnalysisHandler extends BaseEventHandler {
 *   constructor() {
 *     super("FileUploaded", "RunAnalysis");
 *   }
 *
 *   async handle(event: DomainEvent) {
 *     try {
 *       await runAnalysis(event.payload);
 *       return this.success();
 *     } catch (err) {
 *       return this.failure(err as Error);
 *     }
 *   }
 * }
 * ```
 */
export abstract class BaseEventHandler<T extends DomainEvent = DomainEvent>
  implements EventHandler<T>
{
  /**
   * @param eventType - The event type this handler subscribes to
   * @param handlerName - Unique name used to prevent duplicate registration
   */
  constructor(
    public readonly eventType: string,
    public readonly handlerName: string,
  ) {}

  /**
   * Processes a domain event.
   *
   * @param event - The domain event to handle
   * @returns The handler result, either synchronously or as a Promise
   */
  abstract handle(event: T): Promise<EventHandlerResult> | EventHandlerResult;

  /**
   * Creates a successful handler result.
   *
   * @returns An EventHandlerResult with success: true
   */
  protected success(): EventHandlerResult {
    return { success: true };
  }

  /**
   * Creates a failed handler result.
   *
   * @param error - The error or error message
   * @returns An EventHandlerResult with success: false and the error
   */
  protected failure(error: Error | string): EventHandlerResult {
    const errorInstance = error instanceof Error ? error : new Error(error);
    return { success: false, error: errorInstance };
  }
}
