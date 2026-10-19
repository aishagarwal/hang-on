# Contributing to Hang On

Thanks for helping out. Hang On is a small Chrome extension (Manifest V3, plain JavaScript, no build step), so contributing is simple.

## Getting started

1. Fork and clone the repo.
2. Open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the [extension/](extension/) folder.
3. After editing code, click the reload icon on the extension card and reload the tab you're testing.

## Making changes

- Open an issue first for anything bigger than a small fix, so we can agree on the approach.
- Keep changes focused: one fix or feature per pull request.
- Match the style of the surrounding code. There is no linter or build step, so keep it plain JavaScript.
- Keep the extension minimal. No network calls, analytics, or remote code, and ask for as few permissions as possible. Host access stays optional and user-granted.
- Don't add logging to [extension/guard.js](extension/guard.js). It runs inside third-party pages.

## Testing

There is no automated suite yet. Run through the manual checklist in [docs/TESTING.md](docs/TESTING.md) for any change that touches the guard, background, or options code, and say in your PR which cases you ran.

## Pull requests

- Describe what changed and why.
- Include the browser and OS you tested on.
- Update the README or docs if behavior changes.

## Reporting bugs

Use the bug report template. Include the site, Chrome version, and whether you were in an active call.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
