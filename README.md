# ✦ CrystalLyrics

**Beautiful synchronized lyrics for YouTube and YouTube Music.**

CrystalLyrics 1.4 is a free Chrome / Edge extension with word-level highlighting, optional color matching from cover art or video, movable glass lyric windows, independently selectable lyric effects, fonts, and optional local audio timing.

## Get the extension

Download the packaged [`CrystalLyrics-v1.4.zip`](docs/downloads/CrystalLyrics-v1.4.zip) (or obtain the same v1.4 package from a release), then:

1. **Extract** the ZIP into a permanent folder.
2. Open `chrome://extensions` (Chrome) or `edge://extensions` (Edge).
3. Turn on **Developer mode** and choose **Load unpacked**.
4. Select the extracted **CrystalLyrics** folder with `manifest.json` inside.
5. Refresh YouTube or YouTube Music and play a song.

Desktop Chrome/Edge 116+ required. This is a manual-install extension, not a Chrome Web Store listing. The full source as provided in the release ZIP is also under [`extension/CrystalLyrics/`](extension/CrystalLyrics/). See [the extension's original README](extension/CrystalLyrics/README.md) for feature specifics, troubleshooting, permissions, and attribution.

## Website

The public landing page lives in [`docs/`](docs/). It has a responsive dark-glass design, atmospheric album artwork (original abstract CSS graphics), a **silent interactive lyrics demo**, palette picker, live glow/word-lift toggles, installation guide and FAQ. The sample song and demo lyrics are fictional, so no copyrighted recording or lyrics are embedded.

**Preview locally:** Open `docs/index.html` in a browser. The demo works without a server. For downloading the extension ZIP from the site, serve the docs directory with an HTTP server (e.g. `python -m http.server 8000 --directory docs`) or host with GitHub Pages.

**Publish with GitHub Pages:** Repository **Settings → Pages → Build and deployment → Deploy from a branch → `main` → `/docs` → Save**. The expected address will be `https://y2kbeatzz-dot.github.io/Crystal-Lyrics/` once GitHub has deployed it. GitHub Pages must be enabled in settings; committing these files alone does not guarantee the site is live.

## Important notes

- This is not an official Google/YouTube extension.
- Word estimates from line timestamps are *estimates*, not guaranteed precise synchronization. Real word timings take priority.
- Optional audio timing captures the tab only on explicit request, is processed locally, and may download ~80 MB of model data at first use.
- Lyric lookups use LRCLIB and optional cover search uses Apple's public catalog service; see original README for data handling details.
- The website demo is a visual simulation, not the extension itself or live YouTube playback.
- The website respects `prefers-reduced-motion`; the extension has its own Reduce motion option, on by default.
- Bundled font licenses are in [`docs/assets/fonts/`](docs/assets/fonts/) and [`extension/CrystalLyrics/fonts/`](extension/CrystalLyrics/fonts/).

## License

Extension code: MIT as shipped in [`LICENSE.txt`](extension/CrystalLyrics/LICENSE.txt). Bundled third-party notices accompany the files in `extension/CrystalLyrics/vendor/` and fonts directories. Website code: MIT under the same project terms.