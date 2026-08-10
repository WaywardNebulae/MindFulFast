# Leaf Icon + Cold-Start Loading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship soft-fill leaf Play/PWA icons (candy-forward epoxy, light/dark) and a session-gated cold-start pulse overlay, while keeping the in-app header stroke-only.

**Architecture:** One soft-fill SVG is the mark source. Light/dark icon masters bake epoxy in SVG, then a small Node render script writes the PNG set. Boot visibility is a pure helper (`boot-gate.js`) used by `index.html`. Header SVG stays untouched. Play/TWA keeps light 512 URLs; manifest adds dark icons via `prefers-color-scheme`.

**Tech Stack:** Vanilla HTML/CSS/JS PWA, Node (`sharp` for rasterize + `node:test` for gate), Android TWA via Bubblewrap manifest.

**Spec:** `docs/superpowers/specs/2026-08-10-leaf-icon-loading-design.md`

---

## File map

| File | Responsibility |
|------|----------------|
| `icons/leaf.svg` | Soft-fill leaf source (no epoxy) — also inlined conceptually in boot overlay |
| `icons/leaf-icon-light.svg` | Light paper tile + quiet epoxy + soft-fill leaf (full 512 artboard) |
| `icons/leaf-icon-dark.svg` | Dark pine tile + candy-forward epoxy + soft-fill leaf |
| `tools/render-icons.mjs` | Rasterize masters → `icon-*.png` / `icon-*-dark.png` / maskables |
| `boot-gate.js` | Pure `shouldShowBootOverlay` / session key helpers |
| `boot-gate.test.js` | Node tests for boot gate |
| `index.html` | Boot overlay markup/CSS/JS; header left as-is |
| `manifest.json` | Light + dark icon entries with `media` |
| `sw.js` | Bump `CACHE_NAME` so shell/icons refresh |
| `store/twa-manifest.json` | Confirm light 512 URLs (no Apple work) |
| `package.json` (repo root, new) | DevDependency `sharp` + scripts for render/test |

---

### Task 1: Boot-gate helper (TDD)

**Files:**
- Create: `boot-gate.js`
- Create: `boot-gate.test.js`
- Create: `package.json` (minimal, `"type": "module"`)

- [ ] **Step 1: Write the failing test**

```js
// boot-gate.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldShowBootOverlay, SESSION_KEY } from './boot-gate.js';

test('SESSION_KEY is mindfulfast-session', () => {
  assert.equal(SESSION_KEY, 'mindfulfast-session');
});

test('shows when no session flag and not bfcache', () => {
  assert.equal(shouldShowBootOverlay({ hasSessionFlag: false, persisted: false }), true);
});

test('skips when session flag set', () => {
  assert.equal(shouldShowBootOverlay({ hasSessionFlag: true, persisted: false }), false);
});

test('skips bfcache restore even without flag', () => {
  assert.equal(shouldShowBootOverlay({ hasSessionFlag: false, persisted: true }), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test boot-gate.test.js`  
Expected: FAIL (module not found or exports missing)

- [ ] **Step 3: Write minimal implementation**

```js
// boot-gate.js
export const SESSION_KEY = 'mindfulfast-session';

export function shouldShowBootOverlay({ hasSessionFlag, persisted }) {
  if (persisted) return false;
  if (hasSessionFlag) return false;
  return true;
}
```

```json
// package.json
{
  "name": "mindfulfast",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test boot-gate.test.js",
    "icons": "node tools/render-icons.mjs"
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`  
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add boot-gate.js boot-gate.test.js package.json
git commit -m "Add session boot-gate helper with tests"
```

---

### Task 2: Soft-fill leaf SVG source

**Files:**
- Create: `icons/leaf.svg`

- [ ] **Step 1: Add canonical soft-fill leaf (no epoxy, no tile)**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34" fill="none">
  <circle cx="17" cy="17" r="15.5" stroke="#2F6E63" stroke-width="1.3"/>
  <path d="M17 25c0-4.2 2.4-7.4 6.2-8.6C22.8 21 20.4 24.2 17 25z"
        fill="#2F6E63" fill-opacity=".22" stroke="#2F6E63" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M17 25c0-4.2-2.4-7.4-6.2-8.6C11.2 21 13.6 24.2 17 25z"
        fill="#2F6E63" fill-opacity=".35" stroke="#2F6E63" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M17 25V17.5" stroke="#2F6E63" stroke-width="1.3" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 2: Visual check**

Open `icons/leaf.svg` in a browser. Confirm enclosed two-lobe leaf, sea-glass fills, no gloss.

- [ ] **Step 3: Commit**

```bash
git add icons/leaf.svg
git commit -m "Add soft-fill leaf SVG source mark"
```

---

### Task 3: Light + dark icon masters (candy-forward epoxy)

**Files:**
- Create: `icons/leaf-icon-light.svg`
- Create: `icons/leaf-icon-dark.svg`

Artboard: `0 0 512 512`. Rounded rect tile (~112px radius ≈ iOS-ish; Android maskable will crop). Leaf centered at ~58% scale. Safe zone for maskable: keep leaf inside center 80%.

- [ ] **Step 1: Write dark master with candy-forward epoxy**

`icons/leaf-icon-dark.svg` must include:
- Tile fill: gradient `#24353c` → `#101B22` → `#0a1218`
- Soft mint underside radial `rgba(47,110,99,…)` / `#6FC3B2` support glow
- Sharp specular chip (white linear/radial, rotated ~-18°)
- Jelly rim: inset stroke / overlay rect stroke `rgba(111,195,178,0.42)`
- Soft-fill leaf in `#6FC3B2` (same paths as `leaf.svg`, scaled/translated to center)
- No CSS filters that `sharp` cannot rasterize — prefer gradients + shapes

- [ ] **Step 2: Write light master (quieter epoxy)**

`icons/leaf-icon-light.svg`:
- Tile: `#EDF1EF` with subtle top highlight
- Leaf in `#2F6E63`
- Softer specular (lower opacity) so paper stays quiet

- [ ] **Step 3: Open both SVGs in a browser side by side**

Expected: dark tile looks “candy-forward edible”; light is restrained; leaf readable at a glance.

- [ ] **Step 4: Commit**

```bash
git add icons/leaf-icon-light.svg icons/leaf-icon-dark.svg
git commit -m "Add light and dark epoxy icon SVG masters"
```

---

### Task 4: Rasterize PNG icon set

**Files:**
- Create: `tools/render-icons.mjs`
- Modify: `package.json` (add `sharp` devDependency)
- Create/overwrite: `icons/icon-{48,72,96,144,192,256,512}.png`
- Create: `icons/icon-{48,72,96,144,192,256,512}-dark.png`
- Create/overwrite: `icons/icon-maskable-{192,512}.png`
- Create: `icons/icon-maskable-{192,512}-dark.png`

- [ ] **Step 1: Install sharp**

Run: `npm install --save-dev sharp`  
Expected: `node_modules/sharp` present; `package-lock.json` created.

- [ ] **Step 2: Write render script**

```js
// tools/render-icons.mjs
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SIZES = [48, 72, 96, 144, 192, 256, 512];
const MASKABLE = [192, 512];

async function render(src, out, size) {
  await sharp(src)
    .resize(size, size, { fit: 'fill' })
    .png()
    .toFile(out);
  console.log('wrote', out);
}

await mkdir('icons', { recursive: true });

for (const size of SIZES) {
  await render('icons/leaf-icon-light.svg', `icons/icon-${size}.png`, size);
  await render('icons/leaf-icon-dark.svg', `icons/icon-${size}-dark.png`, size);
}
for (const size of MASKABLE) {
  // Masters already include padding; maskable uses same art at full bleed.
  await render('icons/leaf-icon-light.svg', `icons/icon-maskable-${size}.png`, size);
  await render('icons/leaf-icon-dark.svg', `icons/icon-maskable-${size}-dark.png`, size);
}
```

If leaf is too close to edges on maskable preview, revise masters to scale leaf to ~70% and re-run (do not invent a second pipeline).

- [ ] **Step 3: Run renderer**

Run: `npm run icons`  
Expected: all light + dark + maskable PNGs listed in console; files on disk.

- [ ] **Step 4: Spot-check**

Open `icons/icon-512.png`, `icons/icon-512-dark.png`, `icons/icon-48.png`. Confirm epoxy and legibility at 48px.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json tools/render-icons.mjs icons/*.png
git commit -m "Generate light and dark soft-fill epoxy app icons"
```

---

### Task 5: Wire manifest (+ favicon stays light)

**Files:**
- Modify: `manifest.json`
- Modify: `index.html` (favicon lines only if needed — keep light `icons/icon-192.png`)

- [ ] **Step 1: Extend `icons` array**

For each existing light `any` / `maskable` entry, keep it and add a dark sibling with the same `sizes` / `purpose` / `type` and:

```json
"src": "icons/icon-512-dark.png",
"media": "(prefers-color-scheme: dark)"
```

Also add `"media": "(prefers-color-scheme: light)"` on light entries (optional but preferred for clarity). Light entries without media remain valid fallbacks — at minimum ensure unprefixed light icons stay first so older clients work.

Example dark 512 `any` entry:

```json
{
  "src": "icons/icon-512-dark.png",
  "sizes": "512x512",
  "type": "image/png",
  "purpose": "any",
  "media": "(prefers-color-scheme: dark)"
}
```

Repeat for all sizes listed in the current manifest (48–512 + maskables).

- [ ] **Step 2: Validate JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('manifest.json','utf8')); console.log('ok')"`  
Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add manifest.json
git commit -m "Add dark-scheme PWA icons to the manifest"
```

---

### Task 6: Boot overlay UI (markup + CSS)

**Files:**
- Modify: `index.html` (styles before `</style>`, markup before `<div id="app">`)

- [ ] **Step 1: Add CSS after the breathe block (~line 884) and extend reduced-motion**

```css
/* ---------- cold-start boot ---------- */
.boot {
  position: fixed; inset: 0; z-index: 300;
  background: var(--ground);
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
}
.boot.on { display: flex; }
.boot-wrap {
  position: relative;
  width: 96px; height: 96px;
  display: flex; align-items: center; justify-content: center;
}
.boot-pulse {
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  border: 1.5px solid color-mix(in srgb, var(--accent) 35%, transparent);
  animation: boot-pulse 2.2s var(--ease) infinite;
  pointer-events: none;
}
.boot-leaf { width: 72px; height: 72px; display: block; }
.boot-name {
  font-family: var(--serif);
  font-size: 22px;
  font-weight: 500;
  color: var(--ink);
  letter-spacing: -0.01em;
}
@keyframes boot-pulse {
  0%   { transform: scale(0.85); opacity: 0.55; }
  70%  { transform: scale(1.15); opacity: 0; }
  100% { transform: scale(1.15); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .boot-pulse { animation: none !important; opacity: 0; }
}
```

Note: existing rule already forces transition-duration under reduced motion; the block above disables the pulse animation specifically.

If `color-mix` is undesirable for older WebViews, use `rgba(47,110,99,0.35)` and in dark theme rely on `--accent` already switching — prefer:

```css
border: 1.5px solid var(--accent);
opacity: 0.35; /* on .boot-pulse, animate opacity in keyframes from .55 */
```

Use the keyframes opacity path (no `color-mix`) for TWA WebView safety.

- [ ] **Step 2: Add markup immediately before `<div id="app">`**

```html
<div id="boot" class="boot" hidden aria-hidden="true">
  <div class="boot-wrap">
    <div class="boot-pulse" aria-hidden="true"></div>
    <svg class="boot-leaf" viewBox="0 0 34 34" aria-hidden="true">
      <circle cx="17" cy="17" r="15.5" fill="none" stroke="var(--accent)" stroke-width="1.3"/>
      <path d="M17 25c0-4.2 2.4-7.4 6.2-8.6C22.8 21 20.4 24.2 17 25z"
            fill="var(--accent)" fill-opacity=".22" stroke="var(--accent)" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M17 25c0-4.2-2.4-7.4-6.2-8.6C11.2 21 13.6 24.2 17 25z"
            fill="var(--accent)" fill-opacity=".35" stroke="var(--accent)" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M17 25V17.5" fill="none" stroke="var(--accent)" stroke-width="1.3" stroke-linecap="round"/>
    </svg>
  </div>
  <div class="boot-name">MindfulFast</div>
</div>
```

Do **not** change `.head-mark` SVG.

- [ ] **Step 3: Manual CSS check**

Temporarily add `class="boot on"` and remove `hidden`. Confirm pulse + soft-fill leaf on `--ground`. Revert the temporary class before committing logic (next task owns show/hide).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Add cold-start boot overlay markup and pulse styles"
```

---

### Task 7: Boot overlay session gate wiring

**Files:**
- Modify: `index.html` (script load + init)
- Ensure: `boot-gate.js` is served (same origin as `index.html`)

- [ ] **Step 1: Load the helper**

In `<head>` after fonts (or before the main script):

```html
<script type="module">
import { SESSION_KEY, shouldShowBootOverlay } from './boot-gate.js';

function readSessionFlag() {
  try { return sessionStorage.getItem(SESSION_KEY) === '1'; }
  catch (e) { return false; }
}
function writeSessionFlag() {
  try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) {}
}

function showBoot() {
  const el = document.getElementById('boot');
  if (!el) return;
  el.hidden = false;
  el.classList.add('on');
  el.setAttribute('aria-hidden', 'false');
}
function hideBoot() {
  const el = document.getElementById('boot');
  if (!el) return;
  el.classList.remove('on');
  el.hidden = true;
  el.setAttribute('aria-hidden', 'true');
  writeSessionFlag();
}

// Decide as early as possible on this module’s first run.
const persisted = (() => {
  // pageshow may fire later; initial navigation is not bfcache.
  return false;
})();

if (shouldShowBootOverlay({ hasSessionFlag: readSessionFlag(), persisted })) {
  showBoot();
}

window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    hideBoot();
    return;
  }
});

// Expose dismiss for the classic init script below.
window.__mindfulFastHideBoot = hideBoot;
</script>
```

- [ ] **Step 2: Dismiss at end of init**

At the end of the existing init block (after `initScrub();` / before or after `setInterval`), add:

```js
if (typeof window.__mindfulFastHideBoot === 'function') {
  window.__mindfulFastHideBoot();
} else {
  const boot = document.getElementById('boot');
  if (boot) { boot.classList.remove('on'); boot.hidden = true; }
}
```

Important: if the module decides **not** to show, `hideBoot` still must be safe (no-op). If the module **does** show, dismiss runs after first paint/init with **no** artificial delay.

Also handle the case where the module has not run yet: call hide on `requestAnimationFrame` double-rAF after init, or listen:

```js
function dismissBootWhenReady() {
  const run = () => {
    if (typeof window.__mindfulFastHideBoot === 'function') window.__mindfulFastHideBoot();
  };
  run();
  // If the module loads after classic script (rare), retry once.
  requestAnimationFrame(run);
}
dismissBootWhenReady();
```

Only call `writeSessionFlag` inside `hideBoot` when the overlay was shown **or** always set the flag after a successful cold init so same-session reloads skip — per spec, set flag when dismissing a shown boot; also set flag on skip path so a later full navigation in-session… actually same-session reload keeps `sessionStorage`, so flag from first dismiss is enough. On first paint skip (flag already set), do not flash. On first visit show → init → hide → set flag.

When skipping because flag already set, never `showBoot`.

- [ ] **Step 3: Manual verification**

1. Clear site data / new session → overlay pulses, then disappears into timer.  
2. Reload same tab → no overlay.  
3. Enable reduced motion → leaf static, no pulse.  
4. Confirm header leaf still stroke-only.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Gate cold-start boot overlay with sessionStorage"
```

---

### Task 8: Service worker cache bump + TWA check

**Files:**
- Modify: `sw.js` (`CACHE_NAME`)
- Modify: `store/twa-manifest.json` only if URLs need bump query (prefer same paths)

- [ ] **Step 1: Bump cache**

In `sw.js`:

```js
const CACHE_NAME = 'mindfulfast-v5';
```

Optionally append icon paths to `ASSETS` if you want precache (not required today — icons are referenced by manifest). Minimum is cache name bump so `index.html` updates.

- [ ] **Step 2: Confirm TWA icons point at light 512**

`store/twa-manifest.json` already has:

```json
"iconUrl": "https://waywardnebulae.github.io/MindFulFast/icons/icon-512.png",
"maskableIconUrl": "https://waywardnebulae.github.io/MindFulFast/icons/icon-maskable-512.png"
```

No change required once light PNGs are replaced. Do not add Apple assets.

- [ ] **Step 3: Commit**

```bash
git add sw.js store/twa-manifest.json
git commit -m "Bump service worker cache for icon and boot shell"
```

---

### Task 9: Acceptance pass

**Files:** none (verification only)

- [ ] **Step 1: Re-run unit tests**

Run: `npm test`  
Expected: PASS

- [ ] **Step 2: Checklist against spec**

1. Light + dark epoxy icons on disk; dark candy-forward; light quieter.  
2. Manifest lists dark `media` icons; light fallback remains.  
3. Header `.head-mark` unchanged (stroke-only).  
4. Cold start shows pulse boot; same-session reload skips.  
5. Reduced motion: no pulse.  
6. No epoxy on boot overlay.  
7. TWA URLs still light 512.  
8. `DESIGN.md` tokens used (`--ground`, `--accent`, `--ease`, Literata wordmark).

- [ ] **Step 3: Final commit only if fixes landed; otherwise done**

If fixes were needed, commit them with a clear message. If clean, no empty commit.

---

## Spec coverage (self-review)

| Spec requirement | Task |
|------------------|------|
| Soft-fill leaf source | Task 2 |
| Candy-forward epoxy on Play icons only | Tasks 3–4 |
| Light paper / dark pine tiles | Task 3 |
| Dark via `prefers-color-scheme`, light fallback | Task 5 |
| Header stays stroke-only | Tasks 6–7 (explicit non-touch) |
| Pulse boot overlay, matte | Task 6 |
| Session / bfcache gate, no min duration | Tasks 1, 7 |
| Reduced motion | Task 6 |
| Play/TWA, no Apple pass | Tasks 5, 8 |
| SW refresh | Task 8 |

No TBD placeholders. Gate API names (`shouldShowBootOverlay`, `SESSION_KEY`) are consistent across Tasks 1 and 7.
