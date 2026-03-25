import { describe, expect, it, mock } from "bun:test";
import { DataFetchController } from "../../src/controllers/data-fetch.controller";
import { createMockHost } from "../helpers/mock-host";

describe("DataFetchController", () => {
  it("registers itself with the host on construction", () => {
    const host = createMockHost();
    const ctrl = new DataFetchController(host as any);
    expect(host.controllers).toContain(ctrl);
  });

  it("starts in idle state", () => {
    const host = createMockHost();
    const ctrl = new DataFetchController(host as any);
    expect(ctrl.state).toBe("idle");
    expect(ctrl.data).toBeUndefined();
    expect(ctrl.error).toBeUndefined();
  });

  it("stays idle when hasPropertyData is true", async () => {
    const host = createMockHost();
    const ctrl = new DataFetchController(host as any);
    await ctrl.fetch("http://example.com/data.json", true);
    expect(ctrl.state).toBe("idle");
  });

  it("stays idle when no src is provided", async () => {
    const host = createMockHost();
    const ctrl = new DataFetchController(host as any);
    await ctrl.fetch("", false);
    expect(ctrl.state).toBe("idle");
  });

  it("fetches data and transitions to success on 200", async () => {
    const originalFetch = globalThis.fetch;
    const mockData = [{ label: "a", value: 1 }];
    globalThis.fetch = mock(async () => ({
      ok: true,
      json: async () => mockData,
    })) as any;

    const host = createMockHost();
    const ctrl = new DataFetchController(host as any);
    await ctrl.fetch("http://example.com/data.json", false);

    expect(ctrl.state).toBe("success");
    expect(ctrl.data).toEqual(mockData);
    expect(ctrl.error).toBeUndefined();

    globalThis.fetch = originalFetch;
  });

  it("transitions to error state on non-200 response", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(async () => ({
      ok: false,
      status: 404,
    })) as any;

    const host = createMockHost();
    const ctrl = new DataFetchController(host as any);
    await ctrl.fetch("http://example.com/data.json", false);

    expect(ctrl.state).toBe("error");
    expect(ctrl.error).toBeInstanceOf(Error);

    globalThis.fetch = originalFetch;
  });

  it("transitions to error state on network failure", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(async () => {
      throw new Error("Network error");
    }) as any;

    const host = createMockHost();
    const ctrl = new DataFetchController(host as any);
    await ctrl.fetch("http://example.com/data.json", false);

    expect(ctrl.state).toBe("error");
    expect(ctrl.error).toBeInstanceOf(Error);

    globalThis.fetch = originalFetch;
  });

  it("unwraps {data: [...]} response format", async () => {
    const originalFetch = globalThis.fetch;
    const items = [{ label: "b", value: 2 }];
    globalThis.fetch = mock(async () => ({
      ok: true,
      json: async () => ({ data: items }),
    })) as any;

    const host = createMockHost();
    const ctrl = new DataFetchController(host as any);
    await ctrl.fetch("http://example.com/data.json", false);

    expect(ctrl.state).toBe("success");
    expect(ctrl.data).toEqual(items);

    globalThis.fetch = originalFetch;
  });

  it("requests host update after fetch completes", async () => {
    const originalFetch = globalThis.fetch;
    const mockData = [{ label: "c", value: 3 }];
    globalThis.fetch = mock(async () => ({
      ok: true,
      json: async () => mockData,
    })) as any;

    const host = createMockHost();
    const ctrl = new DataFetchController(host as any);
    await ctrl.fetch("http://example.com/data.json", false);

    expect(host.updateCount).toBeGreaterThan(0);

    globalThis.fetch = originalFetch;
  });

  it("emits chart-data-loaded event on success", async () => {
    const originalFetch = globalThis.fetch;
    const mockData = [{ label: "d", value: 4 }];
    globalThis.fetch = mock(async () => ({
      ok: true,
      json: async () => mockData,
    })) as any;

    const host = createMockHost();
    const ctrl = new DataFetchController(host as any);
    await ctrl.fetch("http://example.com/data.json", false);

    const events = host.dispatchedEvents.filter((e) => e.type === "chart-data-loaded");
    expect(events.length).toBe(1);
    expect(events[0].detail).toEqual(mockData);

    globalThis.fetch = originalFetch;
  });

  it("aborts previous fetch when a new one starts", async () => {
    const originalFetch = globalThis.fetch;
    let abortedSignal: AbortSignal | undefined;

    // first call: slow, captures signal
    let resolveFirst!: (v: any) => void;
    const firstPromise = new Promise<any>((res) => {
      resolveFirst = res;
    });

    let callCount = 0;
    globalThis.fetch = mock(async (url: string, init?: RequestInit) => {
      callCount++;
      if (callCount === 1) {
        abortedSignal = init?.signal;
        return firstPromise;
      }
      return { ok: true, json: async () => [] };
    }) as any;

    const host = createMockHost();
    const ctrl = new DataFetchController(host as any);

    // start first (don't await)
    const p1 = ctrl.fetch("http://example.com/slow.json", false);
    // start second immediately, which should abort first
    const p2 = ctrl.fetch("http://example.com/fast.json", false);

    await p2;
    // resolve the first deferred to avoid hanging
    resolveFirst({ ok: true, json: async () => [] });
    await p1;

    expect(abortedSignal?.aborted).toBe(true);

    globalThis.fetch = originalFetch;
  });
});
