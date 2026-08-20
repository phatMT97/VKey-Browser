# VKey Browser

Companion extension for [VKey](https://github.com/phatMT97/VKey). It sends only
the focused tab's hostname and an already-resolved route to VKey's native host.
It never sends a full URL, path, query, page contents, or keystrokes.

Routes:

- **Default** — keep VKey's normal per-app behavior.
- **English** — temporarily bypass Vietnamese processing on this domain.
- **TSF compatibility** — use TSF composition on editors/forums where hook
  replacement can duplicate or attach text after emoji (VKey issue #92).

## Development

1. Install a VKey build containing `VKeyBrowserHost.exe` and register its native
   messaging manifest as described in VKey's `docs/BROWSER_EXTENSION.md`.
2. Open the browser's extension developer page and load this directory unpacked.
3. Use the toolbar popup to set the current domain, or the options page to edit
   all rules.

Chromium development ID: `ccmggbcabaknpjielbiioolpfnpfgkbi`.
Firefox ID: `browser@vkey.phatmt97.github.io`.

Run tests with `npm test` (no dependencies are installed).

## Known browser limitation

Extensions cannot inspect text being typed in the normal address bar/omnibox.
VKey Browser can therefore apply a hostname rule after navigation or tab focus,
but cannot detect that `google.com` is being typed into the address bar before
navigation (VKey issue #100).
