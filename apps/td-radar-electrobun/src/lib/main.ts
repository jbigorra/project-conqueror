import type { AppRPC } from "../shared/types";

export async function useRpc() {
  const { Electroview } = await import("electrobun/view");
  const rpc = Electroview.defineRPC<AppRPC>({
    maxRequestTime: 30_000,
    handlers: { requests: {}, messages: {} },
  });
  const electroview = new Electroview({ rpc });
  return electroview.rpc!;
}
