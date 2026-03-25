import type { ReactiveController, ReactiveControllerHost } from "lit";
import type { FetchState } from "../types";

export class DataFetchController<T = unknown> implements ReactiveController {
  private readonly host: ReactiveControllerHost & Pick<HTMLElement, "dispatchEvent">;
  private abortController: AbortController | null = null;

  state: FetchState = "idle";
  data?: T[];
  error?: Error;

  constructor(host: ReactiveControllerHost & Pick<HTMLElement, "dispatchEvent">) {
    this.host = host;
    host.addController(this);
  }

  hostDisconnected(): void {
    this.abortController?.abort();
    this.abortController = null;
  }

  /**
   * Trigger a data fetch.
   * @param src — URL to fetch
   * @param hasPropertyData — if true, data was provided via property; stay idle
   */
  async fetch(src: string, hasPropertyData: boolean): Promise<void> {
    if (hasPropertyData || !src) {
      this.state = "idle";
      return;
    }

    // Abort any in-flight request
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    this.state = "loading";
    this.host.requestUpdate();

    try {
      const response = await globalThis.fetch(src, { signal });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const json = await response.json();
      const data: T[] = Array.isArray(json) ? json : (json as { data: T[] }).data;

      this.state = "success";
      this.data = data;
      this.error = undefined;

      this.host.dispatchEvent(
        new CustomEvent("chart-data-loaded", {
          detail: data,
          bubbles: true,
          composed: true,
        }),
      );
    } catch (err) {
      if ((err as Error)?.name === "AbortError") {
        // Silently ignore aborted requests — do not flip state
        return;
      }

      this.state = "error";
      this.error = err instanceof Error ? err : new Error(String(err));
      this.data = undefined;

      this.host.dispatchEvent(
        new CustomEvent("chart-error", {
          detail: this.error,
          bubbles: true,
          composed: true,
        }),
      );
    } finally {
      this.host.requestUpdate();
    }
  }
}
