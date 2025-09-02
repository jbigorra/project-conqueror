type TUUID = string;
export class Upload {
  id?: number;
  identifier: TUUID;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(identifier: string, createdAt: Date, updatedAt: Date) {
    this.identifier = identifier;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = null;
  }
}
