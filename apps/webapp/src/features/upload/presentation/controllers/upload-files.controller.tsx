import { t } from "elysia";
import { ConfirmationMessage, UploadForm, type UploadFormSubmitErrors, UploadFormWithErrors, UploadPage } from "../ui/upload.page.tsx";
import { UploadFile } from "#upload/application/use-cases/upload-file.ts";
import { createBaseController } from "#shared/server/controller-factory.ts";

export const uploadFilesController = createBaseController("uploadFilesController")
  .group("/upload", (app) =>
    app
      .decorate("uploadFile", UploadFile.create({}))
      .onError(({ error, code, set, logger }) => {
        logger.error("Error in uploadFilesController", { code });
        if (code) {
          set.status = 200;
          // @ts-ignore
          const errors = error.validator.schema.properties as UploadFormSubmitErrors;
          return (<UploadFormWithErrors values={{}} errors={errors} />);
        }
      })
      .get("/", async ({ logger }) => {
        console.log(logger);
        logger.info("Rendering UploadPage", { test: "test", test2: 1 });
        return (
          <UploadPage>
            <UploadForm values={{}} errors={{}} />
          </UploadPage>
        );
      })
      .post(
        "/",
        async ({ body: { file }, uploadFile }) => {
          try {
            await uploadFile.execute(file);
            return (
              <UploadForm values={{}} errors={{}}>
                <ConfirmationMessage />
              </UploadForm>
            );
          } catch(e: any) {
            // TODO: Need to shape errors to be used in the form
            return (
              <UploadFormWithErrors errors={e.message} values={{file}} />
            );
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
      )
  );
