import type { ReactiveController, ReactiveControllerHost } from "lit";
import type { FetchState } from "../types";

/**
 * Lit reactive controller that fetches JSON data from a URL.
 *
 * Manages loading/error/success states and aborts in-flight requests
 * when the host disconnects or a new fetch begins.
 *
 * @typeParam T - Shape of each item in the fetched array.
 *
 * @fires chart-data-loaded - When data is successfully fetched, with `detail` containing the array.
 * @fires chart-error - When fetching fails, with `detail` containing the Error.
 *
 * @example
 * ```ts
 * class MyChart extends LitElement {
 *   private fetcher = new DataFetchController<MyRecord>(this);
 *   async updated(changed: Map<string, unknown>) {
 *     if (changed.has("src")) await this.fetcher.fetch(this.src ?? "", false);
 *   }
 * }
 * ```
 */
export class DataFetchController<T = unknown> implements ReactiveController {
  private readonly host: ReactiveControllerHost & Pick<HTMLElement, "dispatchEvent">;
  private abortController: AbortController | null = null;

  /** Current fetch lifecycle state. */
  state: FetchState = "idle";
  /** Fetched data array (undefined until a successful fetch). */
  data?: T[];
  /** Error from the most recent failed fetch. */
  error?: Error;

  /**
   * @param host - Lit element that owns this controller.
   */
  constructor(host: ReactiveControllerHost & Pick<HTMLElement, "dispatchEvent">) {
    this.host = host;
    host.addController(this);
  }

  hostDisconnected(): void {
    this.abortController?.abort();
    this.abortController = null;
  }

  /**
   * Fetch data from a URL, unless inline data is already provided.
   *
   * @param src - URL to fetch JSON from.
   * @param hasPropertyData - When `true`, skips fetching (inline data takes priority).
   */
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
