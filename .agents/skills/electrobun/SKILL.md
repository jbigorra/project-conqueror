---
name: electrobun
description: >
  Load Electrobun framework documentation and patterns for building desktop apps with Bun + System WebView.
  Trigger: When working with electrobun, creating desktop apps with electrobun, fixing electrobun code, or when user mentions "electrobun".
license: Apache-2.0
metadata:
  author: Juan Bigorra
  version: "1.0"
---

## When to Use

- Creating or modifying Electrobun desktop applications
- Working with Bun main process or browser view contexts
- Implementing RPC communication between Bun and browser
- Building, configuring, or debugging Electrobun apps

## CRITICAL: NOT Electron

Electrobun is **NOT Electron**. They have completely different architectures and APIs.

| Aspect | Electron | Electrobun |
|--------|----------|------------|
| Runtime | Node.js + Chromium | Bun + System WebView |
| Bundle Size | 150MB+ | ~14MB |
| IPC | ipcMain/ipcRenderer | Typed RPC |
| WebView | Chrome webview tag (deprecated) | Custom electrobun-webview tag |

**NEVER** use Electron APIs or patterns when helping with Electrobun code.

## Import Patterns

```typescript
// Main process (Bun) - use electrobun/bun
import Electrobun from "electrobun/bun";
import {
  BrowserWindow, BrowserView, Tray, ContextMenu, ApplicationMenu,
  Updater, Utils, GlobalShortcut, Screen, Session, BuildConfig, PATHS
} from "electrobun/bun";

// Browser context - use electrobun/view
import { Electroview } from "electrobun/view";
```

## Project Structure

```
my-app/
├── src/
│   ├── bun/           # Main process (runs in Bun)
│   │   └── index.ts
│   ├── views/         # Browser views (HTML/CSS/JS)
│   │   └── mainview/
│   │       └── index.html
│   └── shared/        # Shared types (RPC schemas)
│       └── types.ts
├── icon.iconset/      # App icons (16x16 through 512x512 at 1x and 2x)
├── package.json
└── electrobun.config.ts
```

## Core APIs

### BrowserWindow

```typescript
import { BrowserWindow } from "electrobun/bun";

const win = new BrowserWindow({
  title: "My App",
  url: "views://mainview/index.html",  // Use views:// for bundled content
  html: "<html>...</html>",            // Or load HTML string directly
  frame: { width: 1200, height: 800, x: 100, y: 100 },
  titleBarStyle: "default" | "hidden" | "hiddenInset",
  transparent: false,
  passthrough: false,
  preload: "views://mainview/preload.js",
  rpc: myRpcHandler,
  sandbox: false,
  renderer: "native" | "cef",
});

// Events
win.on("close", (e) => { /* e.data.id */ });
win.on("resize", (e) => { /* e.data: { id, x, y, width, height } */ });
win.on("move", (e) => { /* e.data: { id, x, y } */ });
```

### RPC (Typed Bidirectional Communication)

```typescript
// src/shared/types.ts
import { RPCSchema } from "electrobun/bun";

export type MyRPCType = {
  bun: RPCSchema<{
    requests: {
      addNumbers: { params: { a: number; b: number }; response: number };
    };
    messages: {
      logToBun: { msg: string };
    };
  }>;
  webview: RPCSchema<{
    requests: {
      getDocumentTitle: { params: {}; response: string };
    };
    messages: {
      showNotification: { text: string };
    };
  }>;
};
```

```typescript
// Bun side
const rpc = BrowserView.defineRPC<MyRPCType>({
  handlers: {
    requests: {
      addNumbers: ({ a, b }) => a + b,
    },
    messages: {
      logToBun: ({ msg }) => console.log(msg),
    },
  },
});

const win = new BrowserWindow({ url: "views://main/index.html", rpc });
const title = await win.webview.rpc.request.getDocumentTitle({});
```

```typescript
// Browser side
import { Electroview } from "electrobun/view";

const rpc = Electroview.defineRPC<MyRPCType>({
  handlers: {
    requests: {
      getDocumentTitle: () => document.title,
    },
    messages: {
      showNotification: ({ text }) => alert(text),
    },
  },
});

const electroview = new Electroview({ rpc });
const sum = await electroview.rpc.request.addNumbers({ a: 5, b: 3 });
```

### Electrobun Webview Tag

```html
<electrobun-webview
  src="https://example.com"
  partition="persist:external"
  preload="views://preloads/external.js"
  sandbox
></electrobun-webview>
```

```javascript
const webview = document.querySelector('electrobun-webview');
webview.loadURL("https://other-site.com");
webview.executeJavascript('document.title = "New Title"');
webview.on("dom-ready", (e) => {});
```

### views:// URL Scheme

Load bundled assets from your app:

```typescript
url: "views://mainview/index.html"
preload: "views://mainview/preload.js"
image: "views://assets/icon.png"
```

## Commands

```bash
# Create new project
bunx electrobun init
bunx electrobun init photo-booth

# Development
bun start
bunx electrobun dev

# Build
bunx electrobun build
bunx electrobun build --env canary
bunx electrobun build --env stable
bunx electrobun build --targets macos-arm64,win-x64,linux-x64
```

## Platform Support

| Platform | Architecture | Status | Webview Engine |
|----------|-------------|--------|----------------|
| macOS | ARM64, x64 | Stable | WebKit (WKWebView) |
| Windows | x64 | Stable | Edge WebView2 |
| Linux | x64, ARM64 | Stable | WebKitGTK |

## Resources

- **Full Documentation**: See [references/llms.txt](references/llms.txt) for complete API reference
- **Website**: https://blackboard.sh/electrobun
- **GitHub**: https://github.com/blackboardsh/electrobun
