import { DomainEvent } from "./domain-event";
import { EventHandler, EventHandlerResult } from "./event-handler";

export interface EventBusConfig {
  enableLogging?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export interface PublishResult {
  success: boolean;
  handledCount: number;
  errors: Array<{ handlerName: string; error: Error }>;
}

export class EventBus {
  private readonly handlers = new Map<string, EventHandler[]>();
  private readonly config: Required<EventBusConfig>;

  constructor(config: EventBusConfig = {}) {
    this.config = {
      enableLogging: config.enableLogging ?? false,
      maxRetries: config.maxRetries ?? 0,
      retryDelay: config.retryDelay ?? 1000,
    };
  }

  /**
   * Subscribe an event handler to a specific event type
   */
  subscribe<T extends DomainEvent>(handler: EventHandler<T>): void {
    const eventType = handler.eventType;

    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    const existingHandlers = this.handlers.get(eventType)!;

    // Prevent duplicate handler registration
    const isDuplicate = existingHandlers.some(
      (h) => h.handlerName === handler.handlerName,
    );

    if (isDuplicate) {
      throw new Error(
        `Handler '${handler.handlerName}' is already registered for event '${eventType}'`,
      );
    }

    existingHandlers.push(handler);

    this.log(
      `Subscribed handler '${handler.handlerName}' to event '${eventType}'`,
    );
  }

  /**
   * Unsubscribe a specific handler from an event type
   */
  unsubscribe(eventType: string, handlerName: string): boolean {
    const handlers = this.handlers.get(eventType);
    if (!handlers) return false;

    const initialLength = handlers.length;
    const filteredHandlers = handlers.filter(
      (h) => h.handlerName !== handlerName,
    );

    this.handlers.set(eventType, filteredHandlers);

    const wasRemoved = filteredHandlers.length < initialLength;
    if (wasRemoved) {
      this.log(
        `Unsubscribed handler '${handlerName}' from event '${eventType}'`,
      );
    }

    return wasRemoved;
  }

  /**
   * Unsubscribe all handlers for a specific event type
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
   * Publish an event to all subscribed handlers
   */
  async publish(event: DomainEvent): Promise<PublishResult> {
    const handlers = this.handlers.get(event.eventType) || [];

    this.log(
      `Publishing event '${event.eventType}' to ${handlers.length} handlers`,
    );

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
        const errorInstance =
          error instanceof Error ? error : new Error(String(error));
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
   * Get all registered event types
   */
  getRegisteredEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Get handlers for a specific event type
   */
  getHandlers(eventType: string): EventHandler[] {
    return [...(this.handlers.get(eventType) || [])];
  }

  /**
   * Clear all handlers (useful for testing)
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
            this.log(
              `Handler '${handler.handlerName}' succeeded on attempt ${attempt + 1}`,
            );
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

// Singleton instance for global use
export const eventBus = new EventBus();
