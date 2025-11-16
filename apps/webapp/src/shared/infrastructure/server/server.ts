import packageJson from "#package.json";
import { uploadFilesController } from "#upload/presentation/controllers/upload-files.controller.tsx";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import logixlysia from "logixlysia";
import { indexController } from "./index.controller";

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
          level: ["INFO", "WARN", "ERROR", "DEBUG"],
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
      noCache: process.env.NODE_ENV === "development",
    }),
  )
  .use(indexController)
  .use(uploadFilesController);

export type App = typeof server;
