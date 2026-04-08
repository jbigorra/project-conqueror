/**
 * Contract for domain events published through the EventBus.
 *
 * @example
 * ```ts
 * import type { DomainEvent } from "@prj-conq/lib/patterns";
 *
 * const event: DomainEvent = {
 *   eventId: "abc-123",
 *   eventType: "FileUploaded",
 *   createdAt: new Date(),
 *   aggregateId: "file-1",
 *   version: 1,
 *   payload: { filename: "analysis.log" },
 * };
 * ```
 */
export interface DomainEvent {
  /** Unique identifier for this event instance */
  readonly eventId: string;
  /** Discriminator string identifying the event kind (e.g. "FileUploaded") */
  readonly eventType: string;
  /** Timestamp when the event was created */
  readonly createdAt: Date;
  /** Identifier of the aggregate that produced this event */
  readonly aggregateId: string;
  /** Schema version of the event payload */
  readonly version: number;
  /** Arbitrary event data */
  readonly payload: Record<string, unknown>;
}

/**
 * Abstract base class for domain events with auto-generated id and timestamp.
 *
 * @example
 * ```ts
 * import { BaseDomainEvent } from "@prj-conq/lib/patterns";
 *
 * class FileUploadedEvent extends BaseDomainEvent {
 *   constructor(fileId: string, filename: string) {
 *     super("FileUploaded", fileId, { filename });
 *   }
 * }
 *
 * const event = new FileUploadedEvent("file-1", "analysis.log");
 * ```
 */
export abstract class BaseDomainEvent implements DomainEvent {
  /** Auto-generated unique event identifier */
  public readonly eventId: string;
  /** Auto-set to the current time at construction */
  public readonly createdAt: Date;
  /** Event schema version, defaults to 1 */
  public readonly version: number = 1;

  /**
   * @param eventType - Discriminator string for this event kind
   * @param aggregateId - Identifier of the aggregate that produced this event
   * @param payload - Arbitrary event data
   */
  constructor(
    public readonly eventType: string,
    public readonly aggregateId: string,
    public readonly payload: Record<string, unknown> = {},
  ) {
    this.eventId = this.generateEventId();
    this.createdAt = new Date();
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
