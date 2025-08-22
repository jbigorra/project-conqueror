import { Elysia, t } from "elysia";
import { ConfirmationMessage, UploadForm, UploadFormSubmitErrors, UploadFormWithErrors, UploadPage } from "../ui/upload.page.tsx";
import { html } from "@elysiajs/html";
import { UploadFile } from "#upload/application/use-cases/upload-file.ts";

const BUCKET_PATH =
  "/Users/jbigorra/Projects/project-conqueror/apps/webapp/bucket";

export const uploadFilesController = new Elysia({ prefix: "/upload" })
  .use(html())
  .decorate("uploadFile", UploadFile.create())
  .get("/", async () => {
    return (
      <UploadPage>
        <UploadForm values={{}} errors={{}} />
      </UploadPage>
    );
  })
  .onError(({ error, code, set, body }) => {
    if (code) {
      set.status = 200;
      // @ts-ignore
      const errors = error.validator.schema.properties as UploadFormSubmitErrors;
      return (<UploadFormWithErrors values={{}} errors={errors} />);
    }
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
        return (
          <UploadPage>
            <UploadFormWithErrors errors={e.message} values={{file}} />
          </UploadPage>
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
