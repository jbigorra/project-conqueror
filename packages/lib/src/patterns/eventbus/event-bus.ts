import type { DomainEvent } from "./domain-event";
import type { EventHandler, EventHandlerResult } from "./event-handler";

/**
 * Configuration options for the EventBus.
 *
 * @example
 * ```ts
 * import type { EventBusConfig } from "@prj-conq/lib/patterns";
 *
 * const config: EventBusConfig = {
 *   enableLogging: true,
 *   maxRetries: 3,
 *   retryDelay: 500,
 * };
 * ```
 */
export interface EventBusConfig {
  /** Enable console logging of bus activity (default: false) */
  enableLogging?: boolean;
  /** Number of retry attempts for failed handlers (default: 0) */
  maxRetries?: number;
  /** Delay in ms between retry attempts (default: 1000) */
  retryDelay?: number;
}

/**
 * Result returned after publishing an event to all subscribed handlers.
 *
 * @example
 * ```ts
 * const result = await eventBus.publish(event);
 * if (!result.success) {
 *   console.error(`${result.errors.length} handlers failed`);
 * }
 * ```
 */
export interface PublishResult {
  /** true if all handlers succeeded */
  success: boolean;
  /** Number of handlers that completed successfully */
  handledCount: number;
  /** List of handler failures with handler name and error */
  errors: Array<{ handlerName: string; error: Error }>;
}

/**
 * Publish/subscribe event bus with retry support for domain events.
 *
 * @example
 * ```ts
 * import { EventBus } from "@prj-conq/lib/patterns";
 *
 * const bus = new EventBus({ maxRetries: 2, retryDelay: 500 });
 * bus.subscribe(myHandler);
 * const result = await bus.publish(event);
 * ```
 */
export class EventBus {
  private readonly handlers = new Map<string, EventHandler[]>();
  private readonly config: Required<EventBusConfig>;

  /**
   * @param config - Optional bus configuration (logging, retries, delay)
   */
  constructor(config: EventBusConfig = {}) {
    this.config = {
      enableLogging: config.enableLogging ?? false,
      maxRetries: config.maxRetries ?? 0,
      retryDelay: config.retryDelay ?? 1000,
    };
  }

  /**
   * Subscribe an event handler to a specific event type.
   *
   * @param handler - The event handler to register
   * @throws {Error} If a handler with the same name is already registered for the event type
   *
   * @example
   * ```ts
   * bus.subscribe(new AnalysisHandler());
   * ```
   */
  subscribe<T extends DomainEvent>(handler: EventHandler<T>): void {
    const eventType = handler.eventType;

    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    const existingHandlers = this.handlers.get(eventType) ?? [];

    // Prevent duplicate handler registration
    const isDuplicate = existingHandlers.some((h) => h.handlerName === handler.handlerName);

    if (isDuplicate) {
      throw new Error(
        `Handler '${handler.handlerName}' is already registered for event '${eventType}'`,
      );
    }

    existingHandlers.push(handler);

    this.log(`Subscribed handler '${handler.handlerName}' to event '${eventType}'`);
  }

  /**
   * Unsubscribe a specific handler from an event type.
   *
   * @param eventType - The event type to unsubscribe from
   * @param handlerName - The name of the handler to remove
   * @returns true if the handler was found and removed, false otherwise
   *
   * @example
   * ```ts
   * const removed = bus.unsubscribe("FileUploaded", "RunAnalysis");
   * ```
   */
  unsubscribe(eventType: string, handlerName: string): boolean {
    const handlers = this.handlers.get(eventType);
    if (!handlers) return false;

    const initialLength = handlers.length;
    const filteredHandlers = handlers.filter((h) => h.handlerName !== handlerName);

    this.handlers.set(eventType, filteredHandlers);

    const wasRemoved = filteredHandlers.length < initialLength;
    if (wasRemoved) {
      this.log(`Unsubscribed handler '${handlerName}' from event '${eventType}'`);
    }

    return wasRemoved;
  }

  /**
   * Unsubscribe all handlers for a specific event type.
   *
   * @param eventType - The event type to clear handlers for
   * @returns The number of handlers that were removed
   *
   * @example
   * ```ts
   * const count = bus.unsubscribeAll("FileUploaded");
   * ```
   */
  unsubscribeAll(eventType: string): number {
    const handlers = this.handlers.get(eventType);
    if (!handlers) return 0;

    const count = handlers.length;
    this.handlers.delete(eventType);

    this.log(`Unsubscribed all ${count} handlers from event '${eventType}'`);
    return count;
  }

  /**
   * Publish an event to all subscribed handlers, executing them in parallel.
   *
   * @param event - The domain event to publish
   * @returns Aggregated result with success status, handled count, and errors
   *
   * @example
   * ```ts
   * const result = await bus.publish(new FileUploadedEvent("file-1", "log.txt"));
   * console.log(`${result.handledCount} handlers processed`);
   * ```
   */
  async publish(event: DomainEvent): Promise<PublishResult> {
    const handlers = this.handlers.get(event.eventType) || [];

    this.log(`Publishing event '${event.eventType}' to ${handlers.length} handlers`);

    if (handlers.length === 0) {
      return {
        success: true,
        handledCount: 0,
        errors: [],
      };
    }

    const errors: Array<{ handlerName: string; error: Error }> = [];
    let handledCount = 0;

    // Execute all handlers in parallel
    const handlerPromises = handlers.map(async (handler) => {
      try {
        const result = await this.executeHandlerWithRetry(handler, event);
        if (result.success) {
          handledCount++;
        } else {
          errors.push({
            handlerName: handler.handlerName,
            error: result.error,
          });
        }
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error(String(error));
        errors.push({ handlerName: handler.handlerName, error: errorInstance });
      }
    });

    await Promise.allSettled(handlerPromises);

    const result: PublishResult = {
      success: errors.length === 0,
      handledCount,
      errors,
    };

    this.log(
      `Event '${event.eventType}' processed: ${handledCount} successful, ${errors.length} failed`,
    );

    return result;
  }

  /**
   * Get all registered event types.
   *
   * @returns Array of event type strings that have at least one handler
   *
   * @example
   * ```ts
   * const types = bus.getRegisteredEventTypes();
   * // ["FileUploaded", "AnalysisCompleted"]
   * ```
   */
  getRegisteredEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Get a shallow copy of handlers registered for a specific event type.
   *
   * @param eventType - The event type to look up
   * @returns Array of registered handlers (empty if none)
   *
   * @example
   * ```ts
   * const handlers = bus.getHandlers("FileUploaded");
   * ```
   */
  getHandlers(eventType: string): EventHandler[] {
    return [...(this.handlers.get(eventType) || [])];
  }

  /**
   * Clear all handlers (useful for test cleanup).
   *
   * @example
   * ```ts
   * afterEach(() => {
   *   bus.clear();
   * });
   * ```
   */
  clear(): void {
    this.handlers.clear();
    this.log("Cleared all event handlers");
  }

  private async executeHandlerWithRetry(
    handler: EventHandler,
    event: DomainEvent,
  ): Promise<EventHandlerResult> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await handler.handle(event);

        if (result.success) {
          if (attempt > 0) {
            this.log(`Handler '${handler.handlerName}' succeeded on attempt ${attempt + 1}`);
          }
          return result;
        }

        lastError = result.error;

        if (attempt < this.config.maxRetries) {
          this.log(
            `Handler '${handler.handlerName}' failed (attempt ${attempt + 1}), retrying in ${this.config.retryDelay}ms`,
          );
          await this.delay(this.config.retryDelay);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < this.config.maxRetries) {
          this.log(
            `Handler '${handler.handlerName}' threw error (attempt ${attempt + 1}), retrying in ${
              this.config.retryDelay
            }ms`,
          );
          await this.delay(this.config.retryDelay);
        }
      }
    }

    return {
      success: false,
      error: lastError || new Error("Unknown error occurred"),
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private log(message: string): void {
    if (this.config.enableLogging) {
      console.log(`[EventBus] ${message}`);
    }
  }
}
