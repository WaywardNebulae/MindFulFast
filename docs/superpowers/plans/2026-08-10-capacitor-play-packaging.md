# MindfulFast Capacitor Play Packaging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship MindfulFast as a one-time paid Google Play app by wrapping the existing vanilla web app in Capacitor Android (`com.nebulaelabs.mindfulfast`), with commercial landing/privacy on `nebulaelabs.dev`.

**Architecture:** Copy shippable web assets into a Capacitor `www/` webDir (so `android/` and tooling stay out of the bundle). Capacitator WebView loads local files. Service worker registration is skipped under Capacitor (alarms/notifications paths that depend on SW need a follow-up if broken). Public Stellar site hosts only marketing + privacy, not the full free app. Play App Signing + local upload keystore produce the release `.aab`.

**Tech Stack:** Capacitor 7 (or current stable at implement time), Android Gradle/Android Studio cmdline, Node, existing HTML/CSS/JS, Stellar Hosting for `nebulaelabs.dev`

**Spec:** `docs/superpowers/specs/2026-08-10-capacitor-play-packaging-design.md`

---

## File map

| Path | Role |
|------|------|
| `package.json` | Capacitor deps + `sync:www` / `cap:*` scripts |
| `capacitor.config.json` | `appId`, `appName`, `webDir: "www"` |
| `tools/sync-www.mjs` | Copies allowlisted app files into `www/` |
| `tools/sync-www.test.js` | Asserts allowlist + sync behaviour |
| `www/` | Generated Capacitor web root (gitignored) |
| `android/` | Native Android project from `cap add android` |
| `index.html` | Skip SW register when running inside Capacitor |
| `site/` | Static landing + privacy for Stellar upload (not the full app) |
| `site/index.html` | Nebulae Labs / MindfulFast landing |
| `site/privacy.html` | Play-required privacy policy |
| `.gitignore` | Ignore `www/`, keystores, `*.jks`, local signing props |
| `store/signing-README.md` | How to create/store upload key (no secrets) |
| `store/twa-manifest.json` | Leave in place; not used for paid Capacitor path |

---

### Task 1: Ignore generated/native secrets and add www sync tool (TDD)

**Files:**
- Create: `tools/sync-www.mjs`
- Create: `tools/sync-www.test.js`
- Modify: `.gitignore`
- Modify: `package.json`

- [ ] **Step 1: Write the failing test**

Create `tools/sync-www.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncWww, DEFAULT_ENTRIES } from './sync-www.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');

test('DEFAULT_ENTRIES includes the runnable app surface', () => {
  for (const name of [
    'index.html',
    'sw.js',
    'manifest.json',
    'fonts.css',
    'boot-gate.js',
    'privacy.html',
    'fonts',
    'icons',
  ]) {
    assert.ok(DEFAULT_ENTRIES.includes(name), `missing ${name}`);
  }
});

test('syncWww copies allowlisted files and skips android/node_modules', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-www-'));
  const src = path.join(tmp, 'src');
  const dest = path.join(tmp, 'www');
  fs.mkdirSync(src);
  fs.writeFileSync(path.join(src, 'index.html'), '<html></html>');
  fs.writeFileSync(path.join(src, 'sw.js'), '// sw');
  fs.mkdirSync(path.join(src, 'fonts'));
  fs.writeFileSync(path.join(src, 'fonts', 'x.woff2'), 'x');
  fs.mkdirSync(path.join(src, 'node_modules'));
  fs.writeFileSync(path.join(src, 'node_modules', 'nope.js'), 'no');
  fs.mkdirSync(path.join(src, 'android'));
  fs.writeFileSync(path.join(src, 'android', 'nope'), 'no');

  await syncWww({
    root: src,
    dest,
    entries: ['index.html', 'sw.js', 'fonts'],
  });

  assert.equal(fs.readFileSync(path.join(dest, 'index.html'), 'utf8'), '<html></html>');
  assert.ok(fs.existsSync(path.join(dest, 'fonts', 'x.woff2')));
  assert.equal(fs.existsSync(path.join(dest, 'node_modules')), false);
  assert.equal(fs.existsSync(path.join(dest, 'android')), false);
});

test('repo still has required source entries', () => {
  for (const name of DEFAULT_ENTRIES) {
    assert.ok(fs.existsSync(path.join(repoRoot, name)), `missing source ${name}`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tools/sync-www.test.js`

Expected: FAIL (cannot find module `./sync-www.mjs` or missing export)

- [ ] **Step 3: Implement sync tool**

Create `tools/sync-www.mjs`:

```js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_ENTRIES = [
  'index.html',
  'sw.js',
  'manifest.json',
  'fonts.css',
  'boot-gate.js',
  'privacy.html',
  'fonts',
  'icons',
];

function rmDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function copyEntry(srcRoot, destRoot, name) {
  const from = path.join(srcRoot, name);
  const to = path.join(destRoot, name);
  if (!fs.existsSync(from)) {
    throw new Error(`sync-www: missing ${name}`);
  }
  fs.cpSync(from, to, { recursive: true });
}

export async function syncWww({
  root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
  dest = path.join(root, 'www'),
  entries = DEFAULT_ENTRIES,
} = {}) {
  rmDir(dest);
  fs.mkdirSync(dest, { recursive: true });
  for (const name of entries) {
    copyEntry(root, dest, name);
  }
  return dest;
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` ||
    process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await syncWww();
  console.log('synced www/');
}
```

Note: On Windows the “run as main” check is brittle. Prefer an explicit CLI block:

```js
const isMain = process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  await syncWww();
  console.log('synced www/');
}
```

- [ ] **Step 4: Update `.gitignore` and `package.json`**

Append to `.gitignore`:

```
www/
android/
.idea/
*.keystore
*.jks
keystore.properties
local.properties
```

Update `package.json` scripts/devDeps (exact Capacitor versions: install current stable with npm, then commit lockfile):

```json
{
  "name": "mindfulfast",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test boot-gate.test.js tools/sync-www.test.js",
    "icons": "node tools/render-icons.mjs",
    "sync:www": "node tools/sync-www.mjs",
    "cap:sync": "npm run sync:www && npx cap sync android",
    "cap:open": "npx cap open android"
  },
  "devDependencies": {
    "sharp": "^0.35.3",
    "@capacitor/cli": "^7.0.0",
    "@capacitor/core": "^7.0.0",
    "@capacitor/android": "^7.0.0"
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run:

```bash
npm install
node --test tools/sync-www.test.js
npm test
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add tools/sync-www.mjs tools/sync-www.test.js .gitignore package.json package-lock.json
git commit -m "Add www sync tooling for Capacitor packaging"
```

---

### Task 2: Capacitor config + Android project

**Files:**
- Create: `capacitor.config.json`
- Create: `android/` (via CLI)
- Modify: `package.json` if CLI rewrites versions

- [ ] **Step 1: Add Capacitor config**

Create `capacitor.config.json`:

```json
{
  "appId": "com.nebulaelabs.mindfulfast",
  "appName": "MindfulFast",
  "webDir": "www",
  "server": {
    "androidScheme": "https"
  },
  "android": {
    "allowMixedContent": false
  }
}
```

- [ ] **Step 2: Generate www and add Android platform**

Run:

```bash
npm run sync:www
npx cap add android
npx cap sync android
```

Expected: `android/` created; sync reports copying web assets; applicationId matches `com.nebulaelabs.mindfulfast` in `android/app/build.gradle`.

- [ ] **Step 3: Verify applicationId**

Run:

```bash
# PowerShell
Select-String -Path android/app/build.gradle -Pattern "applicationId|namespace"
```

Expected: both show `com.nebulaelabs.mindfulfast`.

- [ ] **Step 4: Commit Android scaffold (no secrets)**

```bash
git add capacitor.config.json android package.json package-lock.json
git commit -m "Add Capacitor Android app com.nebulaelabs.mindfulfast"
```

If `.gitignore` ignores all of `android/`, either:
- stop ignoring `android/` and only ignore build outputs (`android/.gradle`, `android/app/build`, `android/build`, `android/local.properties`), **preferred**, or
- document regenerating via `cap add android`.

Preferred `.gitignore` replacement for Android (adjust Task 1 if needed before this commit):

```
www/
android/.gradle/
android/build/
android/app/build/
android/local.properties
android/.idea/
*.keystore
*.jks
keystore.properties
local.properties
```

---

### Task 3: Skip service worker inside Capacitor

**Files:**
- Modify: `index.html` (SW registration block ~3680)
- Create: `tools/capacitor-env.test.js` (optional pure helper) — prefer inline guard with a tiny exported helper if extraction is easy; otherwise patch `index.html` and document manual verify.

Capacitor serves from `https://localhost` (androidScheme). SW can misbehave or fight asset updates. For v1, disable SW in native shell; keep SW for any future web demo.

- [ ] **Step 1: Add detection helper file**

Create `capacitor-env.js`:

```js
export function isCapacitorNative() {
  return typeof window !== 'undefined' && !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
}
```

Create `capacitor-env.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { isCapacitorNative } from './capacitor-env.js';

test('isCapacitorNative is false without Capacitor', () => {
  assert.equal(isCapacitorNative(), false);
});
```

Note: in Node, `window` is undefined — implement helper to treat missing `window` as false:

```js
export function isCapacitorNative() {
  if (typeof window === 'undefined') return false;
  const cap = window.Capacitor;
  return !!(cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform());
}
```

- [ ] **Step 2: Run failing/passing unit test**

Run: `node --test capacitor-env.test.js`  
Expected: PASS with the implementation above.

- [ ] **Step 3: Wire into index.html**

Before the SW registration block, load the helper (script type=module or classic — match existing page). Minimal change at registration:

```js
if ('serviceWorker' in navigator) {
  const native = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  if (!native) {
    // existing register('sw.js') path unchanged
  }
}
```

Also add `capacitor-env.js` to `DEFAULT_ENTRIES` in `tools/sync-www.mjs` and update the test allowlist.

- [ ] **Step 4: Sync and smoke on device/emulator**

Run:

```bash
npm run cap:sync
npm run cap:open
```

In Android Studio: Run app. Confirm UI loads, timer works, localStorage works. Confirm DevTools/log shows no SW registration on device (or simply that app functions).

- [ ] **Step 5: Commit**

```bash
git add capacitor-env.js capacitor-env.test.js index.html tools/sync-www.mjs tools/sync-www.test.js package.json
git commit -m "Skip service worker registration in the Capacitor shell"
```

---

### Task 4: Upload keystore + release signing docs

**Files:**
- Create: `store/signing-README.md`
- Create locally (DO NOT COMMIT): `mindfulfast-upload.jks`, `keystore.properties`

- [ ] **Step 1: Generate upload keystore**

Run (user sets passwords; do not commit them):

```bash
keytool -genkey -v -keystore mindfulfast-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias mindfulfast
```

Use org name **Nebulae Labs**, and store the JKS **outside git** or gitignored in repo root.

- [ ] **Step 2: Write signing README (no secrets)**

Create `store/signing-README.md` explaining:
- Play App Signing is on by default
- Upload key = local JKS
- `keystore.properties` example:

```properties
storeFile=../mindfulfast-upload.jks
storePassword=REDACTED
keyAlias=mindfulfast
keyPassword=REDACTED
```

- How to wire `android/app/build.gradle` release signingConfigs from `keystore.properties`
- Never commit JKS or properties

- [ ] **Step 3: Wire Gradle release signing**

In `android/app/build.gradle`, load properties if file exists and attach to `release` buildType (standard Capacitor pattern). Do not put passwords in Gradle.

- [ ] **Step 4: Build release bundle**

Run:

```bash
cd android
./gradlew bundleRelease
```

On Windows:

```bash
cd android
.\gradlew.bat bundleRelease
```

Expected output: `android/app/build/outputs/bundle/release/app-release.aab`

- [ ] **Step 5: Commit docs + gradle wiring only**

```bash
git add store/signing-README.md android/app/build.gradle
git commit -m "Document Play upload signing for Capacitor release builds"
```

---

### Task 5: Commercial site on nebulaelabs.dev (landing + privacy only)

**Files:**
- Create: `site/index.html`
- Create: `site/privacy.html` (adapt from `privacy.html`; contact `hello@nebulaelabs.dev`)
- Create: `site/README.md` (upload notes for Stellar)

**Email standard:**
- Play support / public contact: `hello@nebulaelabs.dev` (already created)
- Optional later: `support@nebulaelabs.dev` only if a separate inbox is needed

- [ ] **Step 1: Create landing page**

`site/index.html` — single composition: Nebulae Labs + MindfulFast name, one short pitch, CTA “Get it on Google Play” (placeholder link until listing exists), link to privacy. No full app embed. No free runnable timer.

- [ ] **Step 2: Create privacy page**

Copy structure/content from root `privacy.html`, but:
- Contact: `hello@nebulaelabs.dev`
- Remove “full free source / use the web app” framing if it undercuts paid Play
- Publisher: Nebulae Labs
- URL path on host: `/privacy.html` or `/mindfulfast/privacy.html` — pick one and document in `site/README.md`

Recommended public URLs:
- `https://nebulaelabs.dev/` — studio home (can start as MindfulFast-focused)
- `https://nebulaelabs.dev/privacy.html` — Play privacy policy URL

- [ ] **Step 3: Stellar setup checklist in README**

Document:
1. Point `nebulaelabs.dev` DNS to Stellar (A/CNAME per their docs)
2. Wait for SSL
3. Upload `site/` files to web root
4. Confirm `hello@nebulaelabs.dev` receives mail (already created)
5. Verify `https://nebulaelabs.dev/privacy.html` loads

- [ ] **Step 4: Update root `privacy.html` contact** to `hello@nebulaelabs.dev` for consistency inside the paid app’s bundled copy.

- [ ] **Step 5: Commit**

```bash
git add site privacy.html
git commit -m "Add Nebulae Labs landing and privacy pages for Play"
```

---

### Task 6: Create paid Play app and upload internal test AAB

**Files:** none in repo required (Console work); update `store/listing.md` if support URL / site URL lines need Nebulae Labs domain.

- [ ] **Step 1: Create app in Play Console**

- Developer: Nebulae Labs  
- App name: from `store/listing.md` (`MindfulFast: Fasting Timer`)  
- Default language: English (US) or (UK) as preferred  
- App/game: App  
- Free/paid: **Paid**  
- Package name: **`com.nebulaelabs.mindfulfast`** (must match Capacitor `appId`)

- [ ] **Step 2: Enable Play App Signing** (default accept)

- [ ] **Step 3: Upload `app-release.aab` to Internal testing**

- [ ] **Step 4: Fill required listing bits that block testing**

- Privacy policy URL: `https://nebulaelabs.dev/privacy.html`  
- Support email: `hello@nebulaelabs.dev`  
- Short/full description: paste from `store/listing.md`  
- Screenshots / feature graphic: from `store/`  
- Content rating questionnaire  
- Target audience / news / COVID declarations as applicable (`None of the above` style answers already used at signup if still accurate)

- [ ] **Step 5: Add yourself as internal tester and install**

Confirm paid entitlement flow on Internal testing (license testers may be needed for paid apps — follow Console prompts for license testing).

- [ ] **Step 6: Record release checklist in `store/play-release-checklist.md`**

Include package ID, domain URLs, email, keystore backup reminder, and “do not publish full free web app.”

```bash
git add store/listing.md store/play-release-checklist.md
git commit -m "Add Play release checklist for paid Capacitor build"
```

---

### Task 7: De-emphasize free public full-app distribution

**Files:**
- Modify: `README.md` (install path → Play when live; GitHub Pages not the product)
- Modify: `store/assetlinks-README.md` — note TWA path retired for paid v1
- Optional: leave `store/twa-manifest.json` but add one-line comment file `store/TWA-RETIRED.md`

- [ ] **Step 1: Update README distribution section**

State clearly: Android distribution is the paid Play app from Nebulae Labs; source may remain visible on GitHub but the supported product is the store build; commercial site is `nebulaelabs.dev`.

- [ ] **Step 2: Mark TWA docs as non-path for v1**

- [ ] **Step 3: Commit**

```bash
git add README.md store/assetlinks-README.md store/TWA-RETIRED.md
git commit -m "Point distribution at paid Play instead of free TWA hosting"
```

---

## Self-review vs spec

| Spec requirement | Task |
|------------------|------|
| Capacitor wrap, local assets | 1–3 |
| Package ID `com.nebulaelabs.mindfulfast` | 2, 6 |
| One-time paid Play | 6 |
| Nebulae Labs + `nebulaelabs.dev` on Stellar | 5–6 |
| No full free public product on commercial domain | 5, 7 |
| Privacy policy HTTPS URL | 5–6 |
| Upload keystore + `.aab` | 4–6 |
| Retire TWA as paid path | 7 |
| `hello@nebulaelabs.dev` | 5–6 |

No subscription work included (YAGNI). Lite public demo deferred (spec default: no).

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-10-capacitor-play-packaging.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks  
2. **Inline Execution** — run tasks in this session with checkpoints  

Which approach?
