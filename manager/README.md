# Claude-to-IM Manager

GUI Manager for Claude-to-IM Bridge. Built with Tauri (like Clash Verge).

**Size: ~15MB** (much smaller than Electron's ~150MB)

## Download

Download from [GitHub Releases](https://github.com/op7418/Claude-to-IM-skill/releases) - no Rust installation needed!

## Features

- System tray with quick controls
- Real-time status monitoring (PID, running state)
- Log viewer with filtering
- Chat history viewer with auto-cleanup
- Auto-start on login option

## Build from Source

You need Rust installed to build locally:

```bash
# 1. Install Rust from https://rustup.rs

# 2. Build
cd manager
npm install
npm run tauri:build
```

Output: `src-tauri/target/release/bundle/`

## Architecture

```
manager/
├── src/                    # React frontend
│   ├── pages/              # UI pages
│   └── store/              # State management
├── src-tauri/              # Rust backend (Tauri)
│   └── src/
│       ├── main.rs         # Entry point
│       ├── bridge.rs       # Process management
│       ├── config.rs       # Settings
│       ├── messages.rs     # Logs/chat
│       └── tray.rs         # System tray
└── icons/
```

## Tech Stack

- **Tauri 1.5** - Rust backend, WebView frontend
- **React 18** - UI
- **Zustand** - State management
- **TypeScript** - Type safety