import packageJson from "#package.json";
import { uploadFilesController } from "#upload/presentation/controllers/upload-files.controller.tsx";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { indexController } from "./index.controller";
import logixlysia from "logixlysia";

const isDevelopment = process.env.NODE_ENV === "development";

export const server = new Elysia()
  .use(
    logixlysia({
      config: {
        showStartupMessage: false,
        timestamp: {
          translateTime: "yyyy-mm-dd HH:MM:ss",
        },
        ip: true,
        logFilePath: "./logs/app.log",
        logFilter: {
          level: ["INFO", "WARNING", "ERROR", "DEBUG"],
        },
        pino: {
          level: isDevelopment ? "debug" : "info",
          transport: isDevelopment
            ? {
                target: "pino-pretty",
                options: { colorize: true, translateTime: "yyyy-mm-dd HH:MM:ss", ignore: "pid,hostname" },
              }
            : {
                target: "pino/file",
                options: { destination: 1 },
              },
          redact: {
            paths: isDevelopment
              ? []
              : [
                  "req.headers.authorization",
                  "req.headers.cookie",
                  "res.headers.set-cookie",
                  "user.password",
                  "user.email",
                  "user.phone",
                ],
            remove: true,
          },
        },
      },
    }),
  )
  .use(
    swagger({
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
  .use(opentelemetry())
  .use(
    staticPlugin({
      assets: "src/assets",
      prefix: "/",
      alwaysStatic: !isDevelopment,
    }),
  )
  .use(indexController)
  .use(uploadFilesController);

export type App = typeof server;
