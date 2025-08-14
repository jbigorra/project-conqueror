import html from "@elysiajs/html";
import { Elysia, t } from "elysia";
import { ConfirmationMessage, UploadPage } from "../ui/upload.page.tsx";

const BUCKET_PATH =
  "/Users/jbigorra/Projects/project-conqueror/apps/webapp/bucket";

export const uploadFilesController = new Elysia({ prefix: "/upload" })
  .use(html())
  .get("/", ({ html }) => UploadPage({ html }))
  .post(
    "/",
    async ({ html, body }) => {
      console.log(body.file);
      const file = await body.file.text();
      await Bun.file(BUCKET_PATH + "/" + body.file.name).write(file);
      return ConfirmationMessage({ html });
    },
    {
      body: t.Object({
        file: t.File(),
      }),
    },
  );
