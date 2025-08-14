import type { App } from "#shared/server/server.ts";
import { treaty } from "@elysiajs/eden";

export const app = treaty<App>("localhost:8080");
