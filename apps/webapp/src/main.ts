import { registerAnalysesEventHandlers } from "#analyses/infrastructure/bootstrap.ts";
import { server } from "#shared/server/server.ts";
import { bootstrapServer } from "./bootstrap";

bootstrapServer({ app: server, eventHandlersBootstraps: [registerAnalysesEventHandlers], port: 8080 });
