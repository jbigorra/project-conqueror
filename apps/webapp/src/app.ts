import { opentelemetry } from "@elysiajs/opentelemetry";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import logixlysia from "logixlysia";
import packageJson from "../package.json";

export interface IStartServerDeps {
  logger: typeof logixlysia;
  openapi: typeof swagger;
  opentelemetry: typeof opentelemetry;
}

type TStartServerFn = (app: Elysia, deps: IStartServerDeps) => Elysia;

export const startServer: TStartServerFn = (app, deps) => {
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
    .use(deps.opentelemetry());
};
