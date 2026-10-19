# Manual testing

There is no automated test suite yet. The guard depends on real browser behavior (WebRTC, `beforeunload`), so check these by hand before a release.

## Setup

1. Open `chrome://extensions` and enable **Developer mode**.
2. Click **Load unpacked** and select the `extension/` folder.
3. Open the extension's options page (click the toolbar icon).
4. Add a site pattern, e.g. `https://meet.google.com/*`, and grant the host permission when Chrome asks.
5. Make sure the global **enabled** switch is on.

After editing code, click the reload icon on the extension card and reload the target tab.

## Cases

| # | Scenario | Expected |
|---|---|---|
| 1 | Join a Google Meet call, then close the tab (Cmd/Ctrl+W or the X) | Chrome shows a "Leave site?" confirmation |
| 2 | In the same call, click **Cancel** on the dialog | Tab stays open and the call continues |
| 3 | In the same call, click **Leave** | Tab closes |
| 4 | Open a Meet tab but don't join a call (home page or lobby), then close it | No prompt |
| 5 | Join a call, then leave it with the page's own hang-up button | No prompt, and the page navigates normally |
| 6 | On Meet, go from `/home` to a meeting URL | No prompt (page-initiated navigation) |
| 7 | Join a call, then reload the tab | Prompt appears |
| 8 | Turn the global switch **off**, join a call, close the tab | No prompt |
| 9 | Remove the site pattern, reload the tab, join a call, close it | No prompt |
| 10 | Visit a site that is not in the list, close the tab | No prompt, and the guard script isn't injected |
| 11 | Revoke the host permission at `chrome://extensions` > Details > Site access | Guard stops applying; options page doesn't break |
| 12 | Restart Chrome with the extension enabled, then repeat case 1 | Prompt still appears (registration persists) |
| 13 | Save an invalid pattern in storage (devtools: `chrome.storage.sync.set({patterns:["bad"]})`) | Other valid sites keep working; a warning appears in the service worker console |

## Notes

- Chrome only shows the `beforeunload` dialog if the user has interacted with the page. If you test without clicking anything, the dialog is skipped by design.
- Service worker logs: `chrome://extensions` > Hang On > **service worker** link.
- The page-side guard no longer logs anything. To debug it, add temporary `console.debug` calls in [extension/guard.js](../extension/guard.js).
