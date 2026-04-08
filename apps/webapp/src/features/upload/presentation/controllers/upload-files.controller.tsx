import { t } from "elysia";
import { createBaseController } from "#shared/server/controller-factory.ts";
import { UploadFile } from "#upload/application/use-cases/upload-file.ts";
import {
  ConfirmationMessage,
  UploadForm,
  type UploadFormSubmitErrors,
  UploadFormWithErrors,
  UploadPage,
} from "../ui/upload.page.tsx";

export const uploadFilesController = createBaseController("uploadFilesController").group(
  "/upload",
  (app) =>
    app
      .decorate("uploadFile", UploadFile.create({}))
      .onError(({ error, code, set, logger }) => {
        if (code === "VALIDATION") {
          set.status = 200;
          const validationError = error as unknown as {
            validator: { schema: { properties: UploadFormSubmitErrors } };
          };
          const errors = validationError.validator.schema.properties;
          logger!.error({ error: errors, msg: `${code}` });
          return <UploadFormWithErrors values={{}} errors={errors} />;
        }
      })
      .get("/", async ({ logger }) => {
        logger.info({ action: "rendering_upload_page" }, "Rendering upload page");
        return (
          <UploadPage>
            <UploadForm values={{}} errors={{}} />
          </UploadPage>
        );
      })
      .post(
        "/",
        async ({ body: { file }, uploadFile, logger }) => {
          try {
            await uploadFile.execute(file);
            return (
              <UploadForm values={{}} errors={{}}>
                <ConfirmationMessage />
              </UploadForm>
            );
          } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            logger.error({ error: e }, "Error uploading file");
            return <UploadFormWithErrors errors={{ file: { error: message } }} values={{}} />;
          }
        },
        {
          body: t.Object({
            file: t.File({
              maxSize: 1024 * 1024 * 20, // 20MB
              minSize: 1, // 1byte,
              error: "A non empty plain/text file with .log extension is required.",
            }),
          }),
        },
      ),
);
