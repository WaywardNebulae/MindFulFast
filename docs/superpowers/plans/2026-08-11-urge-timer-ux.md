# Urge + Timer UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the locked Urge chip flow (with meal-gate distractions), bigger timer-focused dial, ghost Start / solid Urge controls, and top-left Settings — per `docs/superpowers/specs/2026-08-11-urge-timer-ux-design.md`.

**Architecture:** Keep the vanilla `index.html` UI shell. Extract pure meal-gate helpers into `meal-gate.js` (same pattern as `boot-gate.js`) so gate logic is unit-tested with `node --test`. Rewrite Urge post-commit screens to reason chips + distraction list; restyle Timer controls; wire header Settings to `goReview('More')`. Themes stay out of scope.

**Tech Stack:** Vanilla HTML/CSS/JS, Capacitor Android shell (untouched), Node test runner (`node --test`), service worker cache bump in `sw.js`.

---

## File map

| File | Role |
|------|------|
| `meal-gate.js` | Pure helpers: last Meal timestamp, gate closed?, ago label |
| `meal-gate.test.js` | Unit tests for gate |
| `index.html` | Urge UI/flow, Timer layout/CSS, Settings control, distraction actions |
| `package.json` | Add meal-gate tests to `npm test` |
| `sw.js` | Cache name bump |
| Spec (read-only) | `docs/superpowers/specs/2026-08-11-urge-timer-ux-design.md` |

---

### Task 1: Meal gate helpers (TDD)

**Files:**
- Create: `meal-gate.js`
- Create: `meal-gate.test.js`
- Modify: `package.json` (test script)

- [ ] **Step 1: Write the failing tests**

```js
// meal-gate.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MEAL_GATE_MS,
  lastSubstantiveMealAt,
  isMealGateClosed,
  mealAgoLabel
} from './meal-gate.js';

test('MEAL_GATE_MS is 3 hours', () => {
  assert.equal(MEAL_GATE_MS, 3 * 3600000);
});

test('lastSubstantiveMealAt ignores Snack and Drink', () => {
  const now = 1_700_000_000_000;
  const meals = [
    { at: now - 3600000, kind: 'Snack' },
    { at: now - 7200000, kind: 'Meal' },
    { at: now - 1800000, kind: 'Drink' }
  ];
  assert.equal(lastSubstantiveMealAt(meals, now), now - 7200000);
});

test('lastSubstantiveMealAt returns null when no Meal', () => {
  assert.equal(lastSubstantiveMealAt([{ at: 1, kind: 'Snack' }], 10), null);
});

test('isMealGateClosed true inside 3h of Meal', () => {
  const now = 1_700_000_000_000;
  assert.equal(isMealGateClosed([{ at: now - 2.5 * 3600000, kind: 'Meal' }], now), true);
});

test('isMealGateClosed false after 3h', () => {
  const now = 1_700_000_000_000;
  assert.equal(isMealGateClosed([{ at: now - 3.1 * 3600000, kind: 'Meal' }], now), false);
});

test('isMealGateClosed false when only Snack recent', () => {
  const now = 1_700_000_000_000;
  assert.equal(isMealGateClosed([{ at: now - 600000, kind: 'Snack' }], now), false);
});

test('mealAgoLabel formats hours', () => {
  assert.match(mealAgoLabel(2.5 * 3600000), /2/);
});
```

- [ ] **Step 2: Run tests — expect FAIL (module missing)**

```bash
node --test meal-gate.test.js
```

Expected: FAIL resolving `./meal-gate.js`

- [ ] **Step 3: Implement `meal-gate.js`**

```js
export const MEAL_GATE_MS = 3 * 3600000;

export function lastSubstantiveMealAt(meals, now = Date.now()) {
  let best = null;
  for (const m of meals || []) {
    if (!m || m.kind !== 'Meal') continue;
    if (typeof m.at !== 'number' || m.at > now) continue;
    if (best == null || m.at > best) best = m.at;
  }
  return best;
}

export function isMealGateClosed(meals, now = Date.now()) {
  const at = lastSubstantiveMealAt(meals, now);
  if (at == null) return false;
  return (now - at) < MEAL_GATE_MS;
}

export function mealAgoLabel(ms) {
  const mins = Math.max(1, Math.round(ms / 60000));
  if (mins < 60) return mins + (mins === 1 ? ' minute' : ' minutes');
  const h = Math.round(mins / 60);
  if (h < 2) return 'about an hour';
  return 'about ' + h + ' hours';
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
node --test meal-gate.test.js
```

Expected: all pass

- [ ] **Step 5: Wire into npm test**

In `package.json` scripts.test, append ` meal-gate.test.js` after the existing list.

```bash
npm test
```

Expected: existing tests + meal-gate pass

- [ ] **Step 6: Commit** (only if user asked for commits this session)

```bash
git add meal-gate.js meal-gate.test.js package.json
git commit -m "$(cat <<'EOF'
Add meal-gate helpers for short-gap urge routing.

EOF
)"
```

---

### Task 2: Distraction catalog + wire into index

**Files:**
- Modify: `index.html` (near `BUCKETS` / `ALL_ACTIONS`, ~3737+)

- [ ] **Step 1: Add `DISTRACTIONS` and register actions**

After `BUCKETS`, add a flat list used by the new Urge UI. Map to existing ids where possible; add new ones for ice / tinker / read / brush:

```js
const DISTRACTIONS = [
  { id: 'water', name: 'Drink water', mins: 3,
    tip: 'Water or tea. Give it a few minutes before you decide about food.' },
  { id: 'ice-cup', name: 'Cup of ice', mins: 5,
    tip: 'A cup of ice. Cold and something to do with your hands.' },
  { id: 'brush', name: 'Brush teeth / rinse', mins: 3,
    tip: 'Brush or rinse. It resets your mouth and keeps you out of the kitchen.' },
  { id: 'walk', name: 'Brisk walk', mins: 10,
    tip: 'Go outside if you can. Walk fast enough that you breathe a little harder.' },
  { id: 'leave', name: 'Change of scenery', mins: 10,
    tip: 'Leave the room you are in. Another room or the front step is enough.' },
  { id: 'breathe', name: 'Slow breathing', mins: 2,
    tip: 'Breathe in for four. Breathe out for six. Keep the out-breath longer.' },
  { id: 'tinker', name: 'Busy your hands / tinker', mins: 8,
    tip: 'One drawer, a puzzle, or anything small that keeps your hands busy.' },
  { id: 'read-in', name: 'Read something that isn\'t boring to you', mins: 10,
    tip: 'A drama, novel, or anything that needs your attention. Not passive scrolling.' }
];
```

Merge into `ALL_ACTIONS` after the existing `BUCKETS` forEach:

```js
DISTRACTIONS.forEach(a => { ALL_ACTIONS[a.id] = a; });
```

Keep existing `BUCKETS` for any leftover guided-flow paths; primary entry no longer shows pathway blurbs.

- [ ] **Step 2: Export meal-gate into the page**

At the top of the main app `<script>` (or via a small classic script tag before it), load helpers. Prefer a classic script import pattern consistent with the repo:

Option A (simplest for monolith): copy the three functions + constant into `index.html` **and** keep `meal-gate.js` as source of truth for tests — **avoid drift**. Better:

Option B: add before main script:

```html
<script type="module">
  import { MEAL_GATE_MS, lastSubstantiveMealAt, isMealGateClosed, mealAgoLabel } from './meal-gate.js';
  window.MFMealGate = { MEAL_GATE_MS, lastSubstantiveMealAt, isMealGateClosed, mealAgoLabel };
</script>
```

Then in app code use `window.MFMealGate.isMealGateClosed(state.meals)`.

If module load order is awkward with the deferred app script, inline thin wrappers that call the same logic duplicated once from `meal-gate.js` comments “keep in sync with meal-gate.js” — **preferred: Option B with module script before `#app` script**.

- [ ] **Step 3: Manual smoke**

Open Timer, confirm console has no import errors.

- [ ] **Step 4: Commit** (if user asked)

```bash
git add index.html
git commit -m "$(cat <<'EOF'
Add distraction catalog for the Urge chip flow.

EOF
)"
```

---

### Task 3: Urge chip UI (What’s going on?)

**Files:**
- Modify: `index.html` — `#urgeChoices` / `#urgePathway` markup (~1613–1650)
- Modify: CSS for reason chips (`.urge-reason` etc.)
- Modify: `commitUrge`, `renderUrgePathways`, `openPathway`, `resetUrgeHome`

- [ ] **Step 1: Replace `#urgeChoices` content**

Replace pathway title/lead/list with:

```html
<div id="urgeChoices" class="urge-choices" hidden>
  <div class="review-head">
    <h1 class="review-title">What's going on?</h1>
  </div>
  <div class="urge-reasons" id="urgeReasons">
    <button type="button" class="urge-chip" data-reason="hungry" onclick="pickUrgeReason('hungry')">Hungry</button>
    <button type="button" class="urge-chip" data-reason="stress" onclick="pickUrgeReason('stress')">Stress</button>
    <button type="button" class="urge-chip" data-reason="bored" onclick="pickUrgeReason('bored')">Bored</button>
    <button type="button" class="urge-chip" data-reason="habit" onclick="pickUrgeReason('habit')">Habit</button>
    <button type="button" class="urge-chip" data-reason="other" onclick="pickUrgeReason('other')">Other</button>
  </div>
  <button type="button" class="urge-why" onclick="resetUrgeHome()" style="color:var(--ink-3)">Back</button>
</div>

<div id="urgePathway" class="urge-pathway" hidden>
  <button type="button" class="sub-back" onclick="backToReasons()">Back</button>
  <div class="review-head">
    <h1 class="review-title" id="urgePathwayTitle">Try one</h1>
    <p class="review-lead" id="urgePathwayLead"></p>
  </div>
  <div id="urgePathwayActions"></div>
  <div id="urgeHungryFood" hidden>
    <!-- short food ideas + Log a meal button when gate open -->
  </div>
</div>
```

Remove blurb pathway cards, “Why pathways help”, and personal-helped blurbs from this path (optional: keep “What has helped” under distractions later — YAGNI: skip unless already easy).

- [ ] **Step 2: CSS for chips**

```css
.urge-reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 8px var(--gutter) 20px;
}
.urge-chip {
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}
.urge-chip:active { transform: scale(1.02); filter: brightness(1.08); }
```

(Light theme: use `var(--line)` border and `rgba` from ink if white border fails — check both themes.)

- [ ] **Step 3: Implement `pickUrgeReason(reason)`**

```js
function pickUrgeReason(reason) {
  // start or reuse a lightweight draft for correlation trends
  if (!flow) {
    startUrgeFlow();
    // jump off guided wizard UI — close full-screen flow if it opened
    document.getElementById('flow').classList.remove('on');
    flow.quick = true;
  }
  flow.draft.situation = reason === 'hungry' ? 'Hungry'
    : reason === 'stress' ? 'Stress'
    : reason === 'bored' ? 'Bored'
    : reason === 'habit' ? 'Habit' : 'Other';
  flow.draft.bucket = reason === 'hungry' ? 'hungry' : 'context';
  flow.draft.mood = flow.draft.mood || '';
  showUrgeFollowup(reason);
}

function showUrgeFollowup(reason) {
  const choices = document.getElementById('urgeChoices');
  const pathway = document.getElementById('urgePathway');
  const title = document.getElementById('urgePathwayTitle');
  const lead = document.getElementById('urgePathwayLead');
  const actions = document.getElementById('urgePathwayActions');
  const food = document.getElementById('urgeHungryFood');
  if (choices) { choices.hidden = true; choices.classList.remove('on'); }
  if (pathway) { pathway.hidden = false; pathway.classList.add('on'); }

  const gate = window.MFMealGate
    ? window.MFMealGate.isMealGateClosed(state.meals)
    : false;

  if (reason === 'hungry' && !gate) {
    if (title) title.textContent = 'Hungry';
    if (lead) lead.textContent = 'If you need food, have a real meal.';
    if (food) {
      food.hidden = false;
      food.innerHTML =
        '<div class="support-food"><div class="support-link-h">Protein first</div>' +
        '<div class="support-link-p">Eggs, yogurt, beans, fish, chicken, tofu.</div></div>' +
        '<button type="button" class="act" style="margin-top:16px" onclick="openMealSheet()">Log a meal</button>' +
        '<div class="band-label" style="margin-top:22px">Or wait it out</div>';
    }
    renderDistractionActions(actions, DISTRACTIONS.slice(0, 6));
    return;
  }

  if (food) { food.hidden = true; food.innerHTML = ''; }
  if (title) title.textContent = 'Try one';
  if (reason === 'hungry' && gate) {
    const at = window.MFMealGate.lastSubstantiveMealAt(state.meals);
    const ago = window.MFMealGate.mealAgoLabel(Date.now() - at);
    if (lead) lead.textContent = 'You ate about ' + ago + ' ago. This may be an urge, not hunger.';
  } else {
    if (lead) lead.textContent = '';
  }
  renderDistractionActions(actions, DISTRACTIONS.slice(0, 6));
}

function renderDistractionActions(host, list) {
  if (!host) return;
  host.innerHTML = list.map(a =>
    '<button type="button" class="urge-act" onclick="quickTool(\'' + a.id + '\')">' +
    '<div class="urge-act-h">' + esc(a.name) + '</div></button>'
  ).join('');
}

function backToReasons() {
  const pathway = document.getElementById('urgePathway');
  const choices = document.getElementById('urgeChoices');
  if (pathway) { pathway.hidden = true; pathway.classList.remove('on'); }
  if (choices) { choices.hidden = false; choices.classList.add('on'); }
}
```

Update `commitUrge` to show chips only (call nothing that renders pathway blurbs). Delete or gut `renderUrgePathways` callers.

Update `resetUrgeHome` / `backToPathways` → `backToReasons`.

Ensure `quickTool` still logs `action` on the draft for trends.

- [ ] **Step 4: Manual check**

1. Urge → orb → What’s going on? (5 chips, no blurbs)
2. Log a Meal now → Hungry → lead about ago + distractions, no Log a meal
3. No recent Meal → Hungry → food tips + Log a meal + distractions
4. Stress → distractions only; episode reason saved

- [ ] **Step 5: Commit** (if user asked)

```bash
git add index.html
git commit -m "$(cat <<'EOF'
Route Urge through reason chips and meal-gated distractions.

EOF
)"
```

---

### Task 4: Solid Urge orb + ghost Start fast + bigger dial

**Files:**
- Modify: `index.html` CSS (`.act`, `.urge-btn`, `.dial-wrap`, `.urge-btn-wrap`)
- Modify: Timer / Urge markup if needed

- [ ] **Step 1: Ghost Start fast**

Replace `.act` filled styles with skin 5 ghost:

```css
.act-wrap { margin: 14px var(--gutter) 8px; padding: 0; }
.act {
  display: block;
  width: 100%;
  padding: 15px 18px;
  font-family: var(--sans);
  font-size: 17px;
  font-weight: 600;
  color: var(--accent);
  background: transparent;
  border: 1px solid var(--accent);
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
}
.act:active { transform: scale(1.02); filter: brightness(1.08); }
.act.stop {
  color: var(--crit);
  border-color: var(--crit);
  background: transparent;
}
```

- [ ] **Step 2: Bigger solid Urge orb**

```css
.urge-btn-wrap, .urge-btn { width: 200px; height: 200px; }
.urge-btn {
  border: 0;
  background: var(--accent);
  color: var(--ground);
  box-shadow: 0 0 0 8px color-mix(in srgb, var(--accent) 14%, transparent);
}
.urge-btn-l { color: var(--ground); font-size: 22px; }
.urge-btn-s { color: var(--ground); opacity: 0.85; }
.urge-btn:hover, .urge-btn:active {
  border-color: transparent;
  filter: brightness(1.06);
  transform: scale(1.02);
}
```

Verify contrast: accent on ground text — use `color: #071014` if `--ground` fails in light mode.

Trim urge lead/sub copy to one short line or remove per “less blurb” (keep at most: “This usually eases in about 20 minutes.”).

- [ ] **Step 3: Bigger dial**

```css
.dial-wrap {
  max-width: 340px; /* was 300 */
}
.dial-band { padding: 4px var(--gutter) 2px; }
.dial-digits { /* bump ~4–6px if needed for hierarchy */ }
```

If face type looks small relative to ring, increase `.dial-digits` font-size one step.

- [ ] **Step 4: Visual check light + dark**

Hard refresh (SW). Confirm ghost Start, solid Urge, larger dial.

- [ ] **Step 5: Commit** (if user asked)

```bash
git add index.html
git commit -m "$(cat <<'EOF'
Restyle Start fast and Urge orb; enlarge the timer dial.

EOF
)"
```

---

### Task 5: Settings top left

**Files:**
- Modify: `index.html` header markup + CSS
- Modify: remove `.timer-tools` Timer settings button (or hide)

- [ ] **Step 1: Header control**

```html
<header class="head">
  <button type="button" class="head-settings" onclick="goReview('More')">Settings</button>
  <div class="head-mid">...</div>
  <span class="head-clock" id="wallClock">--:--</span>
</header>
```

Move leaf mark into `head-mid` or keep mark centered — **must read Settings top-left**. Suggested grid:

```css
.head {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  /* existing padding */
}
.head-settings {
  justify-self: start;
  background: none; border: 0;
  font-family: var(--sans);
  font-size: 15px; font-weight: 500;
  color: var(--accent);
  padding: 8px 0;
  cursor: pointer;
}
.head-mid { justify-self: center; display: flex; align-items: center; gap: 8px; }
.head-clock { justify-self: end; }
```

- [ ] **Step 2: Remove Timer footer link**

Delete or empty:

```html
<div class="timer-tools">...</div>
```

Ensure Settings hub still has access to timer/alarm controls (`openTimerSettings` from Settings screen — add a row if missing):

In Settings (`#screenMore`), if no Timer settings entry exists, add:

```html
<button type="button" class="settings-actions" onclick="openTimerSettings()">Timer settings</button>
```

(or one button inside the existing settings actions list).

- [ ] **Step 3: Manual check**

Settings top left → full Settings. Alarms still reachable. Timer screen has no bottom Timer settings link.

- [ ] **Step 4: Commit** (if user asked)

```bash
git add index.html
git commit -m "$(cat <<'EOF'
Move Settings to the header and drop the Timer footer link.

EOF
)"
```

---

### Task 6: Cache bump + acceptance pass

**Files:**
- Modify: `sw.js`

- [ ] **Step 1: Bump `CACHE_NAME`** to next version (e.g. `mindfulfast-v28` if current is v27).

- [ ] **Step 2: Run automated tests**

```bash
npm test
```

Expected: PASS including `meal-gate.test.js`

- [ ] **Step 3: Acceptance checklist** (from spec §5)

- [ ] Urge → chips, no blurb cards
- [ ] Hungry + Meal &lt; 3h → distractions, no eat CTA
- [ ] Hungry + no Meal / Meal &gt; 3h → food + Log a meal
- [ ] Distraction labels match spec table (Cup of ice, Change of scenery, Read something that isn’t boring to you, Busy your hands / tinker)
- [ ] Dial larger; Start ghost; Urge solid+larger
- [ ] Settings top left → Settings hub
- [ ] No theme pack

- [ ] **Step 4: Commit** (if user asked)

```bash
git add sw.js index.html meal-gate.js meal-gate.test.js package.json
git commit -m "$(cat <<'EOF'
Ship Urge chip flow and timer-focused control layout.

EOF
)"
```

---

## Spec coverage

| Spec item | Task |
|-----------|------|
| Reason chips, no blurbs | Task 3 |
| Branch + meal gate | Tasks 1, 3 |
| Distractions stay when gate closed | Task 3 |
| Distraction wording | Task 2 |
| Correlation logging | Task 3 (`pickUrgeReason` + `quickTool`) |
| Ghost Start / solid Urge / sizes | Task 4 |
| Settings top left | Task 5 |
| Themes out of scope | — (no task) |
| SW bump | Task 6 |

## Placeholder / consistency check

- Gate constant: `MEAL_GATE_MS = 3h` everywhere.
- Action ids: `ice-cup`, `tinker`, `read-in`, `brush`, `water` (+ existing `walk`, `leave`, `breathe`).
- Settings target: `goReview('More')` (existing Settings screen id path).
- No theme work in any task.
