import { mock } from "bun:test";

/** Stub globalThis.fetch to return a successful JSON response. */
export function mockFetchSuccess(data: unknown): void {
  globalThis.fetch = mock(async () => ({
    ok: true,
    json: async () => data,
  })) as unknown as typeof globalThis.fetch;
}

/** Stub globalThis.fetch to return a non-ok HTTP response. */
export function mockFetchHttpError(status = 404): void {
  globalThis.fetch = mock(async () => ({
    ok: false,
    status,
  })) as unknown as typeof globalThis.fetch;
}

/** Stub globalThis.fetch to reject with a network error. */
export function mockFetchNetworkError(message = "Network error"): void {
  globalThis.fetch = mock(async () => {
    throw new Error(message);
  }) as unknown as typeof globalThis.fetch;
}
