# AGENTS.md

Guidance for AI coding agents working in this repo.

## What this is

Hang On is a Chrome extension (Manifest V3, plain JavaScript, no build step, no dependencies). While a video call is active on a user-chosen site (e.g. Google Meet), closing or leaving the tab triggers Chrome's "Leave site?" confirmation.

## Layout

- [extension/manifest.json](extension/manifest.json): permissions are `storage` and `scripting`; host access is `optional_host_permissions`, granted per site by the user.
- [extension/background.js](extension/background.js): service worker. Reads settings from `chrome.storage.sync` and (re)registers the content script for the sites that have granted permission. Syncs are serialized through a promise queue.
- [extension/guard.js](extension/guard.js): content script, registered with `world: "MAIN"` at `document_start`. Wraps `RTCPeerConnection` to detect an active call, and adds a capture-phase `beforeunload` listener. Uses the Navigation API to skip page-initiated navigations.
- [extension/options.html](extension/options.html), [extension/options.js](extension/options.js): settings page (global switch, site list, permission requests).
- [docs/TESTING.md](docs/TESTING.md): manual test checklist.

## Conventions

- Plain JavaScript, no bundler, no npm packages. Don't introduce a build step without discussion.
- Settings shape is `{ enabled: boolean, patterns: string[] }` in `chrome.storage.sync`. Patterns are Chrome match patterns.
- Keep the permission footprint minimal. No network requests, analytics, or remote code.
- `guard.js` runs in the page's own JS world. Keep it in its IIFE, leak nothing to globals, and don't log from it.
- MV3 service workers are ephemeral. Derive state from storage, not from module variables.

## Checking your work

There are no automated tests. Run `node --check` on changed `.js` files, then walk through the relevant cases in [docs/TESTING.md](docs/TESTING.md) by loading `extension/` unpacked in Chrome. If you can't run Chrome, say so rather than claiming the change works.

## Don't

- Don't commit secrets, `.pem` keys, or zipped builds (see `.gitignore`).
- Don't change the license or the author in `manifest.json` or `LICENSE`.
