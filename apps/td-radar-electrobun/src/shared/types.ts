import type { RPCSchema } from "electrobun/bun";

export type AppRPC = {
  bun: RPCSchema<{
    requests: {
      openFolderDialog: { params: {}; response: string | null };
    };
    messages: {};
  }>;
  webview: RPCSchema<{
    requests: {};
    messages: {};
  }>;
};
