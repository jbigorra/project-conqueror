import type { ReactiveController, ReactiveControllerHost } from "lit";

export type MockHost = ReactiveControllerHost &
  Pick<HTMLElement, "dispatchEvent" | "style"> & {
    controllers: ReactiveController[];
    dispatchedEvents: CustomEvent[];
    updateCount: number;
    _reset(): void;
  };

export function createMockHost(): MockHost {
  let controllers: ReactiveController[] = [];
  let dispatchedEvents: CustomEvent[] = [];
  let updateCount = 0;

  const host: MockHost = {
    controllers,
    dispatchedEvents,
    get updateCount() {
      return updateCount;
    },
    updateComplete: Promise.resolve(true),
    addController(controller: ReactiveController) {
      controllers.push(controller);
    },
    removeController(controller: ReactiveController) {
      const idx = controllers.indexOf(controller);
      if (idx !== -1) controllers.splice(idx, 1);
    },
    requestUpdate() {
      updateCount++;
    },
    dispatchEvent(event: Event): boolean {
      if (event instanceof CustomEvent) {
        dispatchedEvents.push(event);
      }
      return true;
    },
    style: {} as CSSStyleDeclaration,
    _reset() {
      controllers = [];
      dispatchedEvents = [];
      updateCount = 0;
    },
  };

  return host;
}
