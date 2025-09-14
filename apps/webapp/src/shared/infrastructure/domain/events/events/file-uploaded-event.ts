import { BaseDomainEvent } from "@prj-conq/lib/patterns";

export class FileUploadedEvent extends BaseDomainEvent {
  constructor(event: { filename: string; file: File }) {
    super("upload.FileUploaded", event.filename, { filename: event.filename, file: event.file });
  }
}
