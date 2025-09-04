import { LoggerInstance } from "#shared/logging/logger.ts";
import html from "@elysiajs/html";
import { Elysia } from "elysia";

/**
 * @description Create a base controller with all global plugins
 * @param controllerName - The name of the controller
 * @returns A base controller
 */
export const createBaseController = (controllerName: string) =>
  new Elysia({ name: controllerName }) // ignore-prettier
    .use(html()) // ignore-prettier
    .decorate("logger", LoggerInstance.get()) // ignore-prettier
    .as("scoped"); // ignore-prettier

export type BaseController = ReturnType<typeof createBaseController>;
