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

  async fetch(src: string, hasPropertyData: boolean): Promise<void> {
    if (hasPropertyData || !src) {
      this.state = "idle";
      return;
    }

    this.abortInFlight();
    this.state = "loading";
    this.host.requestUpdate();

    try {
      const data = await this.fetchAndParse(src);
      this.handleSuccess(data);
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      this.handleError(err);
    } finally {
      this.host.requestUpdate();
    }
  }

  private abortInFlight(): void {
    this.abortController?.abort();
    this.abortController = new AbortController();
  }

  private async fetchAndParse(src: string): Promise<T[]> {
    const response = await globalThis.fetch(src, {
      signal: this.abortController?.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const json = await response.json();
    return Array.isArray(json) ? json : (json as { data: T[] }).data;
  }

  private handleSuccess(data: T[]): void {
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
  }

  private handleError(err: unknown): void {
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
  }
}
