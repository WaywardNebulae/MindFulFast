# Leaf Icon + Cold-Start Loading — Design Spec

**Date:** 2026-08-10  
**Product:** MindfulFast (vanilla HTML/CSS/JS PWA + Android TWA for Google Play)  
**Status:** Approved for planning

---

## Goal

Replace the dial-ring Play / home-screen icons with a soft-fill leaf mark, and add a calm cold-start loading overlay that uses the same leaf with a pulse ring. Keep the in-app header mark minimal (stroke-only). Target Google Play / Android TWA — not Apple.

---

## Decisions

| Topic | Choice |
|--------|--------|
| Scope | App icons + loading screen |
| Leaf style (icons / loading) | Soft-filled lobes, enclosed circle |
| Leaf style (in-app header) | Existing stroke-only mark (no fill, no gloss) |
| Icon tile (light) | Quiet paper `#EDF1EF` + accent soft-fill leaf |
| Icon tile (dark) | Deep pine `#101B22` + light accent soft-fill leaf |
| Icon gloss | Candy-forward epoxy (mint + hard candy mix), **raster icons only** |
| Loading motion | Still soft-fill leaf + soft pulse ring |
| When loading shows | True cold start / full app reopen only |
| When loading skips | Same session, warm data / bfcache, already-booted session |
| Platform | Play Store + TWA + web PWA; no Apple asset pass |

---

## Architecture

### Shared mark

- One soft-fill leaf SVG is the source of truth for branded surfaces outside chrome (icons + boot overlay).
- Path language matches the refined enclosed leaf (circle + two lobes + stem) with sea-glass fills at ~22% / ~35% opacity.
- Header continues to use the existing stroke-only inline SVG in `index.html` — do not switch it to soft-fill or epoxy.

### Icon pipeline (Play / PWA)

1. Author / keep `icons/leaf.svg` (soft-fill, no gloss in the SVG itself).
2. Rasterize light + dark tiles at required sizes (`48`–`512`, plus maskable `192` / `512`).
3. Bake **candy-forward epoxy** into the PNG tiles only:
   - Crisp specular chip (hard-candy highlight)
   - Jelly teal rim
   - Supporting mint underside glow
   - Light tile uses the same family but quieter (gloss reads less on paper; acceptable)
4. Naming convention under `icons/`:
   - Light (fallback / any): keep existing names `icon-{size}.png`, `icon-maskable-{size}.png`
   - Dark: `icon-{size}-dark.png`, `icon-maskable-{size}-dark.png`
5. Wire `manifest.json` with `media: "(prefers-color-scheme: light|dark)"` where supported; **light paper tile is the fallback** for store / TWA / older clients.
6. Update TWA `iconUrl` / `maskableIconUrl` in `store/twa-manifest.json` to the light 512 assets (Play listing is single-icon; scheme switching is a PWA/launcher nicety where supported). Refresh Bubblewrap/Play package icons from those same light 512 files.

### Boot overlay (in-app)

- Full-viewport layer on `--ground`, centered soft-fill leaf + pulse ring + “MindfulFast” (Literata / existing brand type).
- Matte mark — **no epoxy** on the overlay.
- Gate with `sessionStorage` (e.g. `mindfulfast-session`):
  - **Show** when the flag is absent (fresh process / user fully closed and reopened).
  - **Skip** when flag is set, or `pageshow` with `persisted` (bfcache).
  - After a successful show + dismiss, set the flag for the rest of the session.
- Dismiss as soon as init is ready (`loadState` + first UI paint). No artificial minimum duration.
- `prefers-reduced-motion: reduce` → static leaf, no pulse animation.
- Align with `DESIGN.md`: functional motion, no load fades / glow / splash spectacle. Pulse is a quiet ring expand only.

---

## Visual specs

### Soft-fill leaf (canonical)

- ViewBox `0 0 34 34` (scale freely).
- Circle stroke + two lobe paths + vertical stem.
- Colors:
  - Light surfaces: stroke/fill `#2F6E63` (lobes at ~0.22 / ~0.35 fill-opacity).
  - Dark surfaces: stroke/fill `#6FC3B2` (same opacities).

### Candy-forward epoxy (dark tile reference)

Baked into PNG, not CSS in the running app:

- Base: deep pine gradient toward `#101B22` / `#0a1218`.
- Primary: sharp rotated specular chip (near-white → transparent).
- Rim: inset jelly line `rgba(111,195,178,~0.42)`.
- Support: mint glow at bottom / lower corner; light diagonal wash.
- Soft depth: inset bottom shade, light top rim highlight.
- Light tile: same structure, reduced contrast so paper stays quiet.

### Pulse loading

- Soft-fill leaf centered, unmoving.
- Ring: ~1.5px stroke at accent opacity ~0.35; scale ~0.85 → ~1.15 with opacity to 0 over ~2.2s; ease `cubic-bezier(0.32, 0.72, 0, 1)`.
- Wordmark below leaf; no secondary chrome, stats, or spinner.

---

## Behavior detail

```text
App open
  → sessionStorage has mindfulfast-session?  → skip overlay, normal boot
  → else pageshow.persisted?                 → skip overlay
  → else show overlay immediately (first paint)
       → run init (loadState, first render)
       → remove overlay, set session flag
```

Warm localStorage alone does not force a splash; the session flag is the reopen signal. Full exit clears `sessionStorage` → next open shows overlay again.

---

## Out of scope

- Apple touch icons / App Store assets
- Changing in-app header to soft-fill or glossy
- Artificial minimum splash duration
- Reintroducing dial-ring as the primary brand mark (dial remains the in-app instrument only)

---

## Files expected to change

| Area | Files |
|------|--------|
| Source mark | `icons/leaf.svg` (new) |
| Rasters | `icons/icon-*.png`, `icons/icon-maskable-*.png` (light/dark naming as needed) |
| PWA | `manifest.json`, favicon refs in `index.html` if still used for web shell |
| Boot UI | `index.html` (overlay markup, CSS, session gate, dismiss) |
| Play / TWA | `store/twa-manifest.json` (+ packaging refresh if required) |
| Cache | `sw.js` if icon URLs or HTML shell must bust cache |

---

## Acceptance criteria

1. Play / home-screen icons show soft-fill leaf with candy-forward epoxy; dark follows device dark mode when the host supports scheme-specific icons; otherwise light fallback.
2. In-app header leaf remains stroke-only and matte.
3. Cold start / full reopen shows pulse loading with soft-fill leaf; same-session returns do not.
4. Overlay dismisses when init is ready; reduced-motion users see a static mark.
5. Look stays inside `DESIGN.md` (quiet daylight tokens, scarce accent, no load fades / glow spectacle).

---

## Reference

Brainstorm companion explorations under `.superpowers/brainstorm/` (leaf options, loading motion, epoxy mixes). Final epoxy pick: **candy-forward** mix of glossy mint + hard candy.
