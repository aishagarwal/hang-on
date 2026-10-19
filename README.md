# Hang On

A Chrome extension that asks for confirmation before you close a tab **while a video call is in progress**, so a stray Cmd+W or a mis-click on the tab's X doesn't drop you out of a meeting.

It only acts on sites you choose (e.g. Google Meet) and only while a call is actually active. Outside a call, it does nothing.

## Install

The extension isn't on the Chrome Web Store yet, so load it unpacked:

1. Clone this repo.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and select the [extension/](extension/) folder.

## Usage

1. Click the Hang On toolbar icon to open the settings page.
2. Add a site, such as `meet.google.com` or `*.zoom.us`, and approve Chrome's permission prompt for that site.
3. Reload any tabs already open on that site.

From then on, closing or leaving the tab during a call shows Chrome's "Leave site?" dialog. Choose **Cancel** to stay in the call.

Use the **Enabled** switch to turn the guard off everywhere without removing your sites. Removing a site also revokes its permission.

## How it works

- **Call detection.** On the sites you add, a content script (`guard.js`) runs in the page's own JS world at `document_start` and wraps `RTCPeerConnection`. A call counts as active when a connection is `connected` (or briefly `disconnected`) and has negotiated audio or video. Data-channel-only connections don't count.
- **The guard.** While a call is active, a capture-phase `beforeunload` listener calls `preventDefault()`, which makes Chrome show its confirmation dialog. It also stops the page's own `beforeunload` handlers, such as one that hangs up the call.
- **Page navigations are exempt.** The Navigation API tells the guard when the page itself is navigating (for example Meet moving from the home page to a meeting), so those don't prompt.
- **Registration.** A service worker (`background.js`) reads your settings from `chrome.storage.sync` and registers the guard only for sites where you've granted permission.

## Limitations

- The dialog is Chrome's generic one. Extensions can't customize its text.
- Chrome only shows `beforeunload` dialogs on pages you've interacted with (clicked or typed in).
- It protects against closing the tab or leaving the page. It can't stop you from quitting Chrome or closing the whole window in every case.
- Call detection relies on WebRTC. Sites that don't use WebRTC for calls aren't covered.
- Settings sync across your Chrome profile through `chrome.storage.sync`, but host permissions are granted per device, so a synced site may show "inactive: permission missing" on a new machine until you grant it.

## Privacy

Hang On makes no network requests, runs no remote code, and collects no data. Your site list lives in `chrome.storage.sync`. Host permissions are optional, and you grant them one site at a time.

Permissions used:

| Permission | Why |
|---|---|
| `storage` | Save your enabled switch and site list |
| `scripting` | Register the guard script for your chosen sites |
| Optional host permissions | Inject the guard only on sites you add |

## Development

There is no build step or dependencies. Edit files in [extension/](extension/), click reload on the extension card at `chrome://extensions`, and reload the tab you're testing. The manual test checklist is in [docs/TESTING.md](docs/TESTING.md).

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute.

## License

[MIT](LICENSE)
