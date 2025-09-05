import type { App } from "#shared/server/server.ts";
import { mockFn } from "bun-automock";
import { describe, expect, it, mock, spyOn } from "bun:test";
import { bootstrapServer } from "../src/main.ts";

describe.only("bootstrapServer", () => {
  it("should call the event handlers bootstraps", () => {
    const app = mockFn<App>();
    app.onStart.mockReturnValue(app);
    app.listen.mockReturnValue(app);
    const eventHandlerBootstrap1 = mock<() => void>();
    const eventHandlerBootstrap2 = mock<() => void>();

    bootstrapServer(app, [eventHandlerBootstrap1, eventHandlerBootstrap2]);

    expect(eventHandlerBootstrap1).toHaveBeenCalled();
    expect(eventHandlerBootstrap2).toHaveBeenCalled();
  });

  it("should call the onStart event", () => {
    const app = mockFn<App>();
    app.onStart.mockReturnValue(app);
    app.listen.mockReturnValue(app);
    const eventHandlerBootstrap1 = mock<() => void>();
    const eventHandlerBootstrap2 = mock<() => void>();

    bootstrapServer(app, [eventHandlerBootstrap1, eventHandlerBootstrap2]);

    expect(app.onStart.spy()).toHaveBeenCalled();
  });

  it("should start the server on the specified port", () => {
    const app = mockFn<App>();
    app.onStart.mockReturnValue(app);
    app.listen.mockReturnValue(app);
    const eventHandlerBootstrap1 = mock<() => void>();
    const eventHandlerBootstrap2 = mock<() => void>();

    bootstrapServer(app, [eventHandlerBootstrap1, eventHandlerBootstrap2], 3000);

    expect(app.listen.spy()).toHaveBeenCalledWith(3000);
  });

  it("should log the routes available", () => {
    const port = 8080;
    const eventHandlerBootstrap1 = mock<() => void>();
    const eventHandlerBootstrap2 = mock<() => void>();
    const app = mockFn<App>();
    // @ts-ignore
    app.onStart.mockImplementation((callback) => {
      // @ts-ignore
      callback({ routes: [{ method: "GET", path: "/" }] });
      return app;
    });
    app.listen.mockReturnValue(app);
    // @ts-ignore
    app.server!.port = port;
    const consoleLogSpy = spyOn(console, "log");

    bootstrapServer(app, [eventHandlerBootstrap1, eventHandlerBootstrap2], port);

    expect(consoleLogSpy).toHaveBeenCalledWith("ROUTE LOADED: GET /");
    expect(consoleLogSpy).toHaveBeenCalledWith(`Server is running on http://localhost:${port}`);
  });
});
