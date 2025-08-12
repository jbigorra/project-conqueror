import { opentelemetry } from "@elysiajs/opentelemetry";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import logixlysia from "logixlysia";
import { startServer } from "./app";

startServer(new Elysia(), {
  logger: logixlysia,
  openapi: swagger,
  opentelemetry: opentelemetry,
})
  .get("/", () => ({ hello: "Bun👋" }))
  .listen(8080);
