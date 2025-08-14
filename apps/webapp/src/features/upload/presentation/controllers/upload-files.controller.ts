import html from "@elysiajs/html";
import { Elysia } from "elysia";
import { UploadPage } from "../ui/upload.page";

export const uploadFilesController = new Elysia({ prefix: "/upload" })
  .use(html())
  .get("/", ({ html }) => UploadPage({ html }));
