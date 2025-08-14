import packageJson from "#package.json";
import { uploadFilesController } from "#upload/presentation/controllers/upload-files.controller.ts";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import logixlysia from "logixlysia";

export interface IStartServerDeps {
  logger: typeof logixlysia;
  openapi: typeof swagger;
  opentelemetry: typeof opentelemetry;
}

export const startServer = (app: Elysia, deps: IStartServerDeps) => {
  return app
    .use(
      deps.logger({
        config: {
          showStartupMessage: false,
          timestamp: {
            translateTime: "yyyy-mm-dd HH:MM:ss",
          },
          ip: true,
          logFilePath: "./logs/app.log",
          logFilter: {
            level: ["INFO", "WARN", "ERROR"],
          },
        },
      }),
    )
    .use(
      deps.openapi({
        path: "/openapi",
        documentation: {
          info: {
            title: packageJson.name,
            version: packageJson.version,
            description: packageJson.description,
          },
        },
      }),
    )
    .use(deps.opentelemetry())
    .use(uploadFilesController);
};

export const server = startServer(new Elysia(), {
  logger: logixlysia,
  openapi: swagger,
  opentelemetry: opentelemetry,
});

export type App = typeof server;
