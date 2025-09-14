import type { FileUploadedEvent } from "#shared/domain/events/file-uploaded-event.ts";
import { type EventHandler, type EventHandlerResult } from "@prj-conq/lib/patterns";

export class MainDevAnalysisSubscriber implements EventHandler<FileUploadedEvent> {
  eventType: string = "upload.FileUploaded";
  handlerName: string = MainDevAnalysisSubscriber.name;

  handle(event: FileUploadedEvent): EventHandlerResult {
    console.debug(MainDevAnalysisSubscriber.name, event);
    return { success: true };
  }
}

// receive event
// read file content as text
// pass it to behave to do the analysis
// save the analysis result to S3 and the database
// return success
/**
 * possible analyses:
 * 1. main-dev (knowledge distribution)
 * 2. entity-churn (most refactored entities)
 * 3. change-coupling (most coupled files)
 * 4.
 */
