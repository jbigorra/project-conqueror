import { DomainEntity } from "#shared/generics-types/repository.ts";
import type { UploadRow } from "#upload/infrastructure/db/schemas/uploads.sql.ts";

export class Upload extends DomainEntity {
  id: number;
  identifier: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(id: number, identifier: string, createdAt: Date, updatedAt: Date, deletedAt: Date | null = null) {
    super();
    this.id = id;
    this.identifier = identifier;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  // Factory method that guarantees non-null values from database
  static fromDbRow(dbRow: UploadRow): Upload {
    return new Upload(dbRow.id, dbRow.identifier, dbRow.createdAt, dbRow.updatedAt, dbRow.deletedAt ?? null);
  }

  // Factory for creating new uploads (before database insert)
  static create(identifier: string): Omit<Upload, "id" | "createdAt" | "updatedAt"> {
    return { identifier, deletedAt: null };
  }
}
