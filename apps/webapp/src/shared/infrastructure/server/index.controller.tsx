import { createBaseController } from "./controller-factory";

export const indexController = createBaseController("indexController")
  .get("/", ({ redirect }) => redirect("/upload"))
  .get("/health", () => "OK")
  .get("/metrics", () => process.uptime())


