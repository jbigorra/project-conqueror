import { BrowserView, BrowserWindow, Updater, Utils } from "electrobun/bun";
import type { AppRPC } from "../shared/types";

const DEV_SERVER_PORT = 5173;
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`;

async function getMainViewUrl(): Promise<string> {
  const channel = await Updater.localInfo.channel();
  if (channel === "dev") {
    try {
      await fetch(DEV_SERVER_URL, { method: "HEAD" });
      console.log(`HMR enabled: Using Vite dev server at ${DEV_SERVER_URL}`);
      return DEV_SERVER_URL;
    } catch {
      console.log(
        "Vite dev server not running. Run 'bun run dev:hmr' for HMR support.",
      );
    }
  }
  return "views://mainview/index.html";
}

const rpc = BrowserView.defineRPC<AppRPC>({
  handlers: {
    requests: {
      openFolderDialog: async () => {
        const paths = await Utils.openFileDialog({
          canChooseFiles: false,
          canChooseDirectory: true,
          allowsMultipleSelection: false,
        });
        return paths?.[0]?.trim() ?? null;
      },
    },
    messages: {},
  },
});

// Create the main application window
const url = await getMainViewUrl();

const window = new BrowserWindow({
  title: "TD Radar",
  url,
  frame: {
    width: 1260,
    height: 980,
    x: 200,
    y: 200,
  },
  rpc,
});

// Quit the app when the main window is closed
window.on("close", () => {
  Utils.quit();
});

console.log("SvelteKit + Electrobun app started!");
