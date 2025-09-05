import { registerAnalysesEventHandlers } from "#analyses/infrastructure/bootstrap.ts";
import { server, type App } from "#shared/server/server.ts";

export function bootstrapServer(app: App, eventHandlersBootstraps: (() => void)[], port: number = 8080): void {
  eventHandlersBootstraps.forEach((bootstrapFn) => bootstrapFn());
  app
    .onStart(({ routes }) => {
      for (const route of routes) {
        console.log(`ROUTE LOADED: ${route.method} ${route.path}`);
      }
      console.log(`Server is running on http://localhost:${app.server!.port}`);
    })
    .listen(port);
}

bootstrapServer(server, [registerAnalysesEventHandlers]);
