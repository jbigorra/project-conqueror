export interface DomainEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly occurredAt: Date;
  readonly aggregateId: string;
  readonly version: number;
  readonly payload: Record<string, any>;
}

export abstract class BaseDomainEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly occurredAt: Date;
  public readonly version: number = 1;

  constructor(
    public readonly eventType: string,
    public readonly aggregateId: string,
    public readonly payload: Record<string, any> = {},
  ) {
    this.eventId = this.generateEventId();
    this.occurredAt = new Date();
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
