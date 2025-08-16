import { Elysia, t } from "elysia";
import { ConfirmationMessage, UploadPage } from "../ui/upload.page.tsx";
import { html } from "@elysiajs/html";

const BUCKET_PATH =
  "/Users/jbigorra/Projects/project-conqueror/apps/webapp/bucket";

export const uploadFilesController = new Elysia({ prefix: "/upload" })
  .use(html())
  .get("/", async ({ html }) => {
    return html(<UploadPage />);
  })
  .post(
    "/",
    async ({ body, html }) => {
      console.log(body.file);
      const file = await body.file.text();
      await Bun.file(BUCKET_PATH + "/" + Date.now() + "-" + body.file.name).write(file);
      return html(<ConfirmationMessage />);
    },
    {
      body: t.Object({
        file: t.File(),
      }),
    },
  );
