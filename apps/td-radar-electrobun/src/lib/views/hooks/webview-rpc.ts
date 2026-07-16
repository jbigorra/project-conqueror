import type { AppRPC } from "../../../shared/types";

// Construction lives in its own function so the RPC client type is *inferred*
// from `Electroview.defineRPC`.
// `electrobun/view` isimported dynamically because it touches `window` at module top-level and
// would crash SvelteKit SSR.
async function createBunRpc() {
  const { Electroview } = await import("electrobun/view");
  const rpc = Electroview.defineRPC<AppRPC>({
    maxRequestTime: 30_000,
    handlers: { requests: {}, messages: {} },
  });
  new Electroview({ rpc });
  return rpc;
}

/**
 * The inferred type of the Bun RPC client.
 */
export type BunRpcClient = Awaited<ReturnType<typeof createBunRpc>>;

/**
 * The cached Bun RPC client instance.
 */
let rpcInstance: BunRpcClient | null = null;

/**
 * Returns the Bun RPC client, creating it if necessary.
 * @returns {Promise<BunRpcClient>}
 */
export async function getBunRpc(): Promise<BunRpcClient> {
  if (rpcInstance) return rpcInstance;
  rpcInstance = await createBunRpc();
  return rpcInstance;
}
