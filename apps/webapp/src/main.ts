import { app } from "./shared/infrastructure/server/server";

console.log(`\n\n\n Server is running on http://localhost:${app.server!.port}`);
