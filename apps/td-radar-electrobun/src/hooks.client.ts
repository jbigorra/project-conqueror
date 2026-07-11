  import { Electroview } from "electrobun/view";
  import type { AppRPC } from "./shared/types";

  const rpc = Electroview.defineRPC<AppRPC>({
	maxRequestTime: 30_000,
	handlers: {
		requests: {},
		messages: {},
	},
  });

  export const electroview = new Electroview({ rpc });
  export const bunRpc = electroview.rpc!;
