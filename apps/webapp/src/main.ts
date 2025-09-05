import { registerAnalysesEventHandlers } from "#analyses/infrastructure/bootstrap.ts";
import { server, type App } from "#shared/server/server.ts";

interface BootstrapServerProps {
  app: App;
  eventHandlersBootstraps: (() => void)[];
  port: number;
}

export function bootstrapServer({ app, eventHandlersBootstraps, port }: BootstrapServerProps): void {
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

bootstrapServer({ app: server, eventHandlersBootstraps: [registerAnalysesEventHandlers], port: 8080 });
