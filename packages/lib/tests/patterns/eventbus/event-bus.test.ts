import {
  BaseDomainEvent,
  BaseEventHandler,
  EventBus,
  EventHandlerResult,
} from "#lib/patterns/index.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Test event classes
class TestEvent extends BaseDomainEvent {
  constructor(aggregateId: string, payload: Record<string, any> = {}) {
    super("test.event", aggregateId, payload);
  }
}

class AnotherTestEvent extends BaseDomainEvent {
  constructor(aggregateId: string, payload: Record<string, any> = {}) {
    super("another.test.event", aggregateId, payload);
  }
}

// Test handler classes
class SyncTestHandler extends BaseEventHandler<TestEvent> {
  public handledEvents: TestEvent[] = [];

  constructor(name: string = "SyncTestHandler") {
    super("test.event", name);
  }

  handle(event: TestEvent): EventHandlerResult {
    this.handledEvents.push(event);
    return this.success();
  }
}

class AsyncTestHandler extends BaseEventHandler<TestEvent> {
  public handledEvents: TestEvent[] = [];
  public delay: number;

  constructor(delay: number = 100, name: string = "AsyncTestHandler") {
    super("test.event", name);
    this.delay = delay;
  }

  async handle(event: TestEvent): Promise<EventHandlerResult> {
    await new Promise((resolve) => setTimeout(resolve, this.delay));
    this.handledEvents.push(event);
    return this.success();
  }
}

class FailingHandler extends BaseEventHandler<TestEvent> {
  constructor(name: string = "FailingHandler") {
    super("test.event", name);
  }

  handle(event: TestEvent): EventHandlerResult {
    return this.failure("Handler intentionally failed");
  }
}

class AnotherEventHandler extends BaseEventHandler<AnotherTestEvent> {
  constructor() {
    super("another.test.event", "AnotherHandler");
  }

  handle(): EventHandlerResult {
    return this.success();
  }
}

class ThrowingHandler extends BaseEventHandler<TestEvent> {
  constructor() {
    super("test.event", "ThrowingHandler");
  }

  handle(): EventHandlerResult {
    throw new Error("Handler threw an exception");
  }
}

class FlakyHandler extends BaseEventHandler<TestEvent> {
  private attemptCount = 0;

  constructor() {
    super("test.event", "FlakyHandler");
  }

  handle(): EventHandlerResult {
    this.attemptCount++;
    if (this.attemptCount < 3) {
      return this.failure("Temporary failure");
    }
    return this.success();
  }

  getAttemptCount(): number {
    return this.attemptCount;
  }
}

describe("EventBus", () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe("Subscription Management", () => {
    it("should subscribe handlers to events", () => {
      const handler = new SyncTestHandler();

      expect(() => eventBus.subscribe(handler)).not.toThrow();
      expect(eventBus.getRegisteredEventTypes()).toContain("test.event");
      expect(eventBus.getHandlers("test.event")).toHaveLength(1);
    });

    it("should prevent duplicate handler registration", () => {
      const handler1 = new SyncTestHandler("SameHandler");
      const handler2 = new SyncTestHandler("SameHandler");

      eventBus.subscribe(handler1);

      expect(() => eventBus.subscribe(handler2)).toThrow(
        "Handler 'SameHandler' is already registered for event 'test.event'",
      );
    });

    it("should allow multiple different handlers for same event", () => {
      const handler1 = new SyncTestHandler("Handler1");
      const handler2 = new SyncTestHandler("Handler2");

      eventBus.subscribe(handler1);
      eventBus.subscribe(handler2);

      expect(eventBus.getHandlers("test.event")).toHaveLength(2);
    });

    it("should unsubscribe specific handlers", () => {
      const handler1 = new SyncTestHandler("Handler1");
      const handler2 = new SyncTestHandler("Handler2");

      eventBus.subscribe(handler1);
      eventBus.subscribe(handler2);

      const wasRemoved = eventBus.unsubscribe("test.event", "Handler1");

      expect(wasRemoved).toBe(true);
      expect(eventBus.getHandlers("test.event")).toHaveLength(1);
      expect(eventBus.getHandlers("test.event")[0]!.handlerName).toBe(
        "Handler2",
      );
    });

    it("should return false when unsubscribing non-existent handler", () => {
      const wasRemoved = eventBus.unsubscribe("test.event", "NonExistent");
      expect(wasRemoved).toBe(false);
    });

    it("should unsubscribe all handlers for an event type", () => {
      const handler1 = new SyncTestHandler("Handler1");
      const handler2 = new SyncTestHandler("Handler2");

      eventBus.subscribe(handler1);
      eventBus.subscribe(handler2);

      const removedCount = eventBus.unsubscribeAll("test.event");

      expect(removedCount).toBe(2);
      expect(eventBus.getHandlers("test.event")).toHaveLength(0);
    });

    it("should clear all handlers", () => {
      const handler1 = new SyncTestHandler();
      const handler2 = new AnotherEventHandler();

      eventBus.subscribe(handler1);
      eventBus.subscribe(handler2);

      eventBus.clear();

      expect(eventBus.getRegisteredEventTypes()).toHaveLength(0);
    });
  });

  describe("Event Publishing", () => {
    it("should publish events to subscribed handlers", async () => {
      const handler = new SyncTestHandler();
      const event = new TestEvent("test-id", { data: "test" });

      eventBus.subscribe(handler);
      const result = await eventBus.publish(event);

      expect(result.success).toBe(true);
      expect(result.handledCount).toBe(1);
      expect(result.errors).toHaveLength(0);
      expect(handler.handledEvents).toHaveLength(1);
      expect(handler.handledEvents[0]).toBe(event);
    });

    it("should handle events with no subscribers", async () => {
      const event = new TestEvent("test-id");

      const result = await eventBus.publish(event);

      expect(result.success).toBe(true);
      expect(result.handledCount).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle multiple handlers in parallel", async () => {
      const handler1 = new AsyncTestHandler(50, "Handler1");
      const handler2 = new AsyncTestHandler(100, "Handler2");
      const event = new TestEvent("test-id");

      eventBus.subscribe(handler1);
      eventBus.subscribe(handler2);

      const startTime = Date.now();
      const result = await eventBus.publish(event);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(result.handledCount).toBe(2);
      expect(handler1.handledEvents).toHaveLength(1);
      expect(handler2.handledEvents).toHaveLength(1);

      // Should execute in parallel, not sequentially
      expect(endTime - startTime).toBeLessThan(150); // Less than sum of delays
    });

    it("should collect errors from failing handlers", async () => {
      const successHandler = new SyncTestHandler();
      const failingHandler = new FailingHandler();
      const event = new TestEvent("test-id");

      eventBus.subscribe(successHandler);
      eventBus.subscribe(failingHandler);

      const result = await eventBus.publish(event);

      expect(result.success).toBe(false);
      expect(result.handledCount).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]!.handlerName).toBe("FailingHandler");
      expect(result.errors[0]!.error.message).toBe(
        "Handler intentionally failed",
      );
    });

    it("should handle thrown exceptions in handlers", async () => {
      const throwingHandler = new ThrowingHandler();
      const event = new TestEvent("test-id");

      eventBus.subscribe(throwingHandler);
      const result = await eventBus.publish(event);

      expect(result.success).toBe(false);
      expect(result.handledCount).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]!.error.message).toBe(
        "Handler threw an exception",
      );
    });
  });

  describe("Configuration and Retry Logic", () => {
    it("should retry failed handlers when configured", async () => {
      const eventBusWithRetry = new EventBus({ maxRetries: 2, retryDelay: 10 });
      const flakyHandler = new FlakyHandler();
      const event = new TestEvent("test-id");

      eventBusWithRetry.subscribe(flakyHandler);
      const result = await eventBusWithRetry.publish(event);

      expect(result.success).toBe(true);
      expect(flakyHandler.getAttemptCount()).toBe(3); // Initial attempt + 2 retries
    });

    it("should enable logging when configured", async () => {
      const consoleSpy = vi.spyOn(console, "log");
      const eventBusWithLogging = new EventBus({ enableLogging: true });

      const handler = new SyncTestHandler();
      const event = new TestEvent("test-id");

      eventBusWithLogging.subscribe(handler);
      await eventBusWithLogging.publish(event);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[EventBus] Subscribed handler 'SyncTestHandler' to event 'test.event'",
        ),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[EventBus] Publishing event 'test.event' to 1 handlers",
        ),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Domain Events", () => {
    it("should create domain events with proper metadata", () => {
      const event = new TestEvent("aggregate-123", { key: "value" });

      expect(event.eventType).toBe("test.event");
      expect(event.aggregateId).toBe("aggregate-123");
      expect(event.payload).toEqual({ key: "value" });
      expect(event.eventId).toBeDefined();
      expect(event.occurredAt).toBeInstanceOf(Date);
      expect(event.version).toBe(1);
    });

    it("should generate unique event IDs", () => {
      const event1 = new TestEvent("test-1");
      const event2 = new TestEvent("test-2");

      expect(event1.eventId).not.toBe(event2.eventId);
    });
  });
});
