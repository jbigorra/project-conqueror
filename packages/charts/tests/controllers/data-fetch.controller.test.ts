import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { DataFetchController } from "../../src/controllers/data-fetch.controller";
import { createMockHost, type MockHost } from "../helpers/mock-host";

describe("DataFetchController", () => {
  let host: MockHost;
  let ctrl: DataFetchController<{ label: string; value: number }>;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    host = createMockHost();
    ctrl = new DataFetchController(host);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    host._reset();
  });

  it("registers itself with the host on construction", () => {
    expect(host.controllers).toContain(ctrl);
  });

  it("starts in idle state", () => {
    expect(ctrl.state).toBe("idle");
    expect(ctrl.data).toBeUndefined();
    expect(ctrl.error).toBeUndefined();
  });

  it("stays idle when hasPropertyData is true", async () => {
    await ctrl.fetch("http://example.com/data.json", true);
    expect(ctrl.state).toBe("idle");
  });

  it("stays idle when no src is provided", async () => {
    await ctrl.fetch("", false);
    expect(ctrl.state).toBe("idle");
  });

  it("fetches data and transitions to success on 200", async () => {
    const mockData = [{ label: "a", value: 1 }];
    globalThis.fetch = mock(async () => ({
      ok: true,
      json: async () => mockData,
    })) as unknown as typeof globalThis.fetch;

    await ctrl.fetch("http://example.com/data.json", false);

    expect(ctrl.state).toBe("success");
    expect(ctrl.data).toEqual(mockData);
    expect(ctrl.error).toBeUndefined();
  });

  it("transitions to error state on non-200 response", async () => {
    globalThis.fetch = mock(async () => ({
      ok: false,
      status: 404,
    })) as unknown as typeof globalThis.fetch;

    await ctrl.fetch("http://example.com/data.json", false);

    expect(ctrl.state).toBe("error");
    expect(ctrl.error).toBeInstanceOf(Error);
  });

  it("transitions to error state on network failure", async () => {
    globalThis.fetch = mock(async () => {
      throw new Error("Network error");
    }) as unknown as typeof globalThis.fetch;

    await ctrl.fetch("http://example.com/data.json", false);

    expect(ctrl.state).toBe("error");
    expect(ctrl.error).toBeInstanceOf(Error);
  });

  it("unwraps {data: [...]} response format", async () => {
    const items = [{ label: "b", value: 2 }];
    globalThis.fetch = mock(async () => ({
      ok: true,
      json: async () => ({ data: items }),
    })) as unknown as typeof globalThis.fetch;

    await ctrl.fetch("http://example.com/data.json", false);

    expect(ctrl.state).toBe("success");
    expect(ctrl.data).toEqual(items);
  });

  it("requests host update after fetch completes", async () => {
    globalThis.fetch = mock(async () => ({
      ok: true,
      json: async () => [{ label: "c", value: 3 }],
    })) as unknown as typeof globalThis.fetch;

    await ctrl.fetch("http://example.com/data.json", false);

    expect(host.updateCount).toBeGreaterThan(0);
  });

  it("emits chart-data-loaded event on success", async () => {
    const mockData = [{ label: "d", value: 4 }];
    globalThis.fetch = mock(async () => ({
      ok: true,
      json: async () => mockData,
    })) as unknown as typeof globalThis.fetch;

    await ctrl.fetch("http://example.com/data.json", false);

    const events = host.dispatchedEvents.filter((e) => e.type === "chart-data-loaded");
    expect(events.length).toBe(1);
    expect(events[0]?.detail).toEqual(mockData);
  });

  it("aborts previous fetch when a new one starts", async () => {
    let abortedSignal: AbortSignal | null | undefined;
    let resolveFirst!: (v: Response) => void;
    const firstPromise = new Promise<Response>((res) => {
      resolveFirst = res;
    });

    let callCount = 0;
    globalThis.fetch = mock(async (_url: string, init?: RequestInit) => {
      callCount++;
      if (callCount === 1) {
        abortedSignal = init?.signal;
        return firstPromise;
      }
      return { ok: true, json: async () => [] } as unknown as Response;
    }) as unknown as typeof globalThis.fetch;

    const p1 = ctrl.fetch("http://example.com/slow.json", false);
    const p2 = ctrl.fetch("http://example.com/fast.json", false);

    await p2;
    resolveFirst({ ok: true, json: async () => [] } as unknown as Response);
    await p1;

    expect(abortedSignal?.aborted).toBe(true);
  });
});
