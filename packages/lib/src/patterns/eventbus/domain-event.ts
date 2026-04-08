export interface DomainEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly createdAt: Date;
  readonly aggregateId: string;
  readonly version: number;
  readonly payload: Record<string, unknown>;
}

export abstract class BaseDomainEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly createdAt: Date;
  public readonly version: number = 1;

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
