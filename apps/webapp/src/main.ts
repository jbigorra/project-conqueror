import { server } from "#shared/server/server.ts";
import Elysia from "elysia";

const app = new Elysia().use(server).listen(8080);

console.log(`\n\n\n Server is running on http://localhost:${app.server!.port}`);
