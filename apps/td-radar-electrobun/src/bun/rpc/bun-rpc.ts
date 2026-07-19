import { BrowserView } from "electrobun";
import type { AppRPC } from "../../shared/types";
import { addRepository } from "../application/add-repository.action";

export const rpc = BrowserView.defineRPC<AppRPC>({
  handlers: {
    requests: {
      openFolderDialog: addRepository,
    },
    messages: {},
  },
});
