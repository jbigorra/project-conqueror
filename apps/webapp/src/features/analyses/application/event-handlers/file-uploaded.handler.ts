import type { FileUploadedEvent } from "#shared/domain/events/file-uploaded-event.ts";
import { type EventHandler, type EventHandlerResult } from "@prj-conq/lib/patterns";

export class FileUploadedHandler implements EventHandler<FileUploadedEvent> {
  eventType: string = "upload.FileUploaded";
  handlerName: string = FileUploadedHandler.name;

  handle(event: FileUploadedEvent): EventHandlerResult {
    console.debug(FileUploadedHandler.name, event);
    return { success: true };
  }
}
