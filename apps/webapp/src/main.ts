import { registerAnalysesEventHandlers } from "#analyses/infrastructure/bootstrap.ts";
import { server } from "#shared/server/server.ts";
import Elysia from "elysia";

// Bootstrap event handlers
registerAnalysesEventHandlers();

// Start server by using the server instance
const app = new Elysia().use(server).listen(8080);

console.log(`\n\n\n Server is running on http://localhost:${app.server!.port}`);
