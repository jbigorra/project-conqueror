import type { App } from "#src/shared/infrastructure/server/server.ts";
import { treaty } from "@elysiajs/eden";

export const app = treaty<App>("localhost:8080");
