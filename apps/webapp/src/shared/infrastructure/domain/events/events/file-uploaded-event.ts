import { BaseDomainEvent } from "@prj-conq/lib/patterns";

export class FileUploadedEvent extends BaseDomainEvent {
  constructor(event: { filename: string }) {
    super("upload.FileUploaded", event.filename, { filename: event.filename });
  }
}
