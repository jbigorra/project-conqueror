import packageJson from "#package.json";
import { uploadFilesController } from "#upload/presentation/controllers/upload-files.controller.tsx";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import logixlysia from "logixlysia";
import { LoggerFactory } from "../logging/logger";
import { type BaseController } from "./controller-factory";
import { indexController } from "./index.controller";

export interface IStartServerDeps {
  httpLogger: typeof logixlysia;
  customLogger: ReturnType<typeof LoggerFactory.getLogger>;
  openapi: typeof swagger;
  opentelemetry: typeof opentelemetry;
  static: typeof staticPlugin;
  controllers: BaseController[];
}

export const startServer = (app: Elysia, deps: IStartServerDeps) => {
  return (
    app
      /**
       * The plugins for the server are those that don't need to expose
       * a decorator in the controllers.
       */
      .use(
        deps.httpLogger({
          config: {
            showStartupMessage: false,
            timestamp: {
              translateTime: "yyyy-mm-dd HH:MM:ss",
            },
            ip: true,
            logFilePath: "./logs/app.log",
            logFilter: {
              level: ["INFO", "WARN", "ERROR", "DEBUG"],
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
      .use(
        deps.static({
          assets: "src/assets",
          prefix: "/",
          noCache: process.env.NODE_ENV === "development",
        }),
      )
      // Controllers
      .use(deps.controllers)
  );
};

export const server = startServer(new Elysia(), {
  httpLogger: logixlysia,
  customLogger: LoggerFactory.getLogger(),
  openapi: swagger,
  opentelemetry: opentelemetry,
  static: staticPlugin,
  controllers: [indexController, uploadFilesController],
});

export type App = typeof server;
