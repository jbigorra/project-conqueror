import type { AppRPC } from "../../../shared/types";

let rpcInstance: AppRPC["bun"] | null = null;

export async function getBunRpc(): Promise<AppRPC["bun"]> {
  if (rpcInstance) return rpcInstance;
  const { Electroview } = await import("electrobun/view");
  const electroview = new Electroview({
    rpc: Electroview.defineRPC<AppRPC>({
      maxRequestTime: 30_000,
      handlers: { requests: {}, messages: {} },
    }),
  });

  rpcInstance = electroview.rpc as unknown as AppRPC["bun"];

  return rpcInstance;
}
