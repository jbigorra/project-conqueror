import type { RPCSchema } from "electrobun/bun";

export type AppRPC = {
  bun: RPCSchema<{
    requests: {
      openFolderDialog: { params: undefined; response: Promise<string | null> };
    };
    // biome-ignore lint/complexity/noBannedTypes: Temporary ignore
    messages: {};
  }>;
  webview: RPCSchema<{
    // biome-ignore lint/complexity/noBannedTypes: Temporary ignore
    requests: {};
    // biome-ignore lint/complexity/noBannedTypes: Temporary ignore
    messages: {};
  }>;
};
