# EventBus Implementation

A simple, type-safe EventBus for domain communication in the Store application.

## Features

- **Type-safe**: Full TypeScript support with generic event handlers
- **Async/Sync Support**: Handlers can be synchronous or asynchronous
- **Error Handling**: Comprehensive error collection and reporting
- **Retry Logic**: Configurable retry mechanism for failed handlers
- **Parallel Execution**: Multiple handlers execute in parallel for performance
- **Logging**: Optional logging for debugging and monitoring
- **Duplicate Prevention**: Prevents duplicate handler registration

## Basic Usage

### 1. Create Domain Events

```typescript
import { BaseDomainEvent } from "../Shared/EventBus";

export class ProductCreatedEvent extends BaseDomainEvent {
  constructor(
    productId: string,
    payload: {
      name: string;
      basePrice: number;
      type: string;
    }
  ) {
    super("product.created", productId, payload);
  }
}
```

### 2. Create Event Handlers

```typescript
import { BaseEventHandler, EventHandlerResult } from "../Shared/EventBus";
import { ProductCreatedEvent } from "../Inventory/Events/ProductEvents";

export class CatalogProductCreatedHandler extends BaseEventHandler<ProductCreatedEvent> {
  constructor() {
    super("product.created", "CatalogProductCreatedHandler");
  }

  handle(event: ProductCreatedEvent): EventHandlerResult {
    try {
      // Update the product catalog
      console.log(`New product: ${event.payload.name}`);
      return this.success();
    } catch (error) {
      return this.failure(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
```

### 3. Subscribe Handlers and Publish Events

```typescript
import { eventBus } from "../Shared/EventBus";
import { ProductCreatedEvent } from "./Events/ProductEvents";
import { CatalogProductCreatedHandler } from "../ProductCatalog/Handlers/ProductEventHandlers";

// Subscribe handlers
const catalogHandler = new CatalogProductCreatedHandler();
eventBus.subscribe(catalogHandler);

// Publish events
const event = new ProductCreatedEvent("product-123", {
  name: "Mountain Bike",
  basePrice: 500,
  type: "bicycle"
});

const result = await eventBus.publish(event);
console.log(`Event handled by ${result.handledCount} handlers`);
```

## Configuration

```typescript
import { EventBus } from "../Shared/EventBus";

const eventBus = new EventBus({
  enableLogging: true,    // Enable console logging
  maxRetries: 3,          // Retry failed handlers 3 times
  retryDelay: 1000        // Wait 1 second between retries
});
```

## Domain Communication Examples

### Inventory → ProductCatalog
When a product is created in Inventory, the ProductCatalog updates its search indexes:

```typescript
// In Inventory domain
const event = new ProductCreatedEvent(productId, productData);
await eventBus.publish(event);

// In ProductCatalog domain
class CatalogProductCreatedHandler extends BaseEventHandler<ProductCreatedEvent> {
  handle(event: ProductCreatedEvent): EventHandlerResult {
    // Update search indexes, caches, etc.
    return this.success();
  }
}
```

### Inventory → ShoppingCart
When stock changes, the ShoppingCart validates current items:

```typescript
// In Inventory domain
const event = new ProductStockUpdatedEvent(productId, stockData);
await eventBus.publish(event);

// In ShoppingCart domain
class CartStockValidationHandler extends BaseEventHandler<ProductStockUpdatedEvent> {
  handle(event: ProductStockUpdatedEvent): EventHandlerResult {
    // Remove out-of-stock items from carts
    return this.success();
  }
}
```

## Error Handling

The EventBus collects all errors and continues processing:

```typescript
const result = await eventBus.publish(event);

if (!result.success) {
  console.log(`${result.errors.length} handlers failed:`);
  result.errors.forEach(error => {
    console.log(`- ${error.handlerName}: ${error.error.message}`);
  });
}
```

## Testing

Use the EventBus in tests by creating mock handlers:

```typescript
class MockHandler extends BaseEventHandler<TestEvent> {
  public handledEvents: TestEvent[] = [];

  constructor() {
    super("test.event", "MockHandler");
  }

  handle(event: TestEvent): EventHandlerResult {
    this.handledEvents.push(event);
    return this.success();
  }
}

// In tests
const mockHandler = new MockHandler();
eventBus.subscribe(mockHandler);
await eventBus.publish(testEvent);
expect(mockHandler.handledEvents).toHaveLength(1);
```

## Best Practices

1. **Event Naming**: Use dot notation for event types (`domain.action`)
2. **Handler Naming**: Use descriptive names that indicate the domain and purpose
3. **Error Handling**: Always handle errors gracefully in handlers
4. **Async Operations**: Use async handlers for I/O operations
5. **Testing**: Clear the EventBus between tests using `eventBus.clear()`
6. **Singleton Usage**: Use the exported `eventBus` singleton for global communication

## Architecture Benefits

- **Loose Coupling**: Domains don't directly depend on each other
- **Scalability**: Easy to add new handlers without modifying existing code
- **Testability**: Mock handlers for isolated testing
- **Maintainability**: Clear separation of concerns between domains
- **Extensibility**: New domains can easily subscribe to existing events 
