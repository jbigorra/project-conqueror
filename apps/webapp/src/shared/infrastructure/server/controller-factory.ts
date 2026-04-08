import html from "@elysiajs/html";
import { type Context, Elysia } from "elysia";
import type { Logger } from "logixlysia";
import packageJson from "#package.json";

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * @description Create a base controller with all global plugins
 * @param controllerName - The name of the controller
 * @returns A base controller
 */
export const createBaseController = (controllerName: string) =>
  new Elysia({ name: controllerName }) // ignore-prettier
    .use(html()) // ignore-prettier
    .derive(({ store }): { logger: Logger["pino"] } => ({
      logger: (store as { pino: Logger["pino"] }).pino.child({
        module: controllerName,
        requestId: crypto.randomUUID(),
      }),
    }))
    .as("scoped"); // ignore-prettier

export type BaseController = ReturnType<typeof createBaseController>;
