# Urge + Timer UX redesign

**Date:** 2026-08-11  
**App:** MindfulFast (`index.html`)  
**Status:** Design approved in brainstorm; not yet implemented

---

## Goal

Get the Urge path to the point fast, keep the Timer focused on the dial, and use a modern control language (ghost Start + solid Urge). Do not reinforce eating when a real meal was logged recently. Themes beyond light/dark/system are out of this pass.

---

## Locked decisions


| Topic            | Decision                                                                     |
| ---------------- | ---------------------------------------------------------------------------- |
| Urge entry       | After “I have an urge” → one question: **What’s going on?**                  |
| Reason chips     | Hungry / Stress / Bored / Habit / Other — labels only, no pathway blurbs     |
| Branching        | Different follow-up by reason                                                |
| Recent meal gate | Last logged entry is **Meal** (not Snack/Drink) within **2–3 hours**         |
| Gate behavior    | No eat / Log a meal CTA; **distraction recommendations stay**                |
| Material         | Skin 5: ghost/outline Start fast + solid mint Urge orb                       |
| Settings         | Text **Settings** top left → full Settings hub                               |
| Dial / Urge size | Dial bigger (timer is the focus); Urge orb bigger                            |
| Themes           | Deferred (rainbow, baby pink, army/cargo, luxury, Neapolitan, custom upload) |


---

## 1. Urge flow

### 1.1 Entry

1. User taps **I have an urge** (solid mint orb).
2. Show immediately: **What’s going on?** with five chips.
3. Do not show pathway cards with description blurbs on this path.

### 1.2 After chip

**Hungry — meal gate open** (no Meal in last 2–3 hours, or only Snack/Drink):

- Short food ideas (existing support-style tips, kept short).
- **Log a meal** available.

**Hungry — meal gate closed** (last **Meal** within 2–3 hours):

- One line: they ate about X ago; this may be an urge, not hunger.
- No Log a meal / eat CTA.
- Show the distraction list (below) and start a timed practice when one is chosen.

**Stress / Bored / Habit / Other:**

- Same distraction list (or a short subset tagged for that reason if needed).
- Timed practice on pick.
- Log the reason on the episode draft.

### 1.3 Distraction list (safe wording)

Grounded in common urge-surfing / CBT delay activities (e.g. Northwestern “Managing Urges and Cravings”, eating-incompatible tasks, intense-sensation style coping). Labels must stay low-liability and plain.


| Label                                   | Notes                                               |
| --------------------------------------- | --------------------------------------------------- |
| Drink water                             | Water or tea                                        |
| Cup of ice                              | Not “chew ice”                                      |
| Brush teeth / rinse                     | Mouth reset                                         |
| Brisk walk                              | 5–10 minutes                                        |
| Change of scenery                       | Change place                                        |
| Slow breathing                          | ~2 minutes                                          |
| Busy your hands / tinker                | One drawer, puzzle, fidget                          |
| Read something that isnt boring to you. | Drama / novel — needs attention, not passive scroll |


Show about 5–6 on the primary screen; the rest can sit under a short “More” if the list feels long. Prefer the ones that map cleanly to existing timed actions where possible (`breathe`, `walk`, `leave`, `drink`, etc.). Add new action ids only when needed (`ice-cup`, `tinker`, `read-in`).

### 1.4 Logging

- Still create/update an urge episode with reason (`situation` / `bucket` / equivalent). Still need this data so we can display correlation trends.
- Outcome of the timed practice stays as today when they finish or skip.

### 1.5 Removed from this entry path

- Pathway blurbs (“why this helps” paragraphs under each pathway).
- “Answer a few questions first” as the default front door (guided flow can remain reachable later if already linked elsewhere; not required on the commit screen).

---

## 2. Timer layout

### 2.1 Hierarchy

1. Header: brand / clock as today; **Settings** text control top left (or left of header row — must read as top-left).
2. Dial: larger than current; primary visual.
3. Phase pill + time stay on the dial face.
4. Protocols stay under the dial (text + underline active state).
5. **Start fast** — ghost/outline button (skin 5).
6. **Log a meal** — secondary text under it.
7. Remove the bottom **Timer settings** link once Settings is top-left and opens the full hub (timer-specific options remain inside Settings / existing timer sheet nested there if needed).

### 2.2 Control material (skin 5)

**Start fast (ghost)**

- Transparent / near-transparent fill.
- 1px light border.
- Accent text.
- Press: slight brightness up + scale ~1.02.
- **End fast** uses the same shape with crit border/text (or crit fill if ghost fails contrast — prefer outline crit first).

**Urge orb (solid)**

- Solid mint/accent fill.
- Dark text for contrast (≥4.5:1).
- Larger than current (~168 → ~200px class size, tune on device).
- Optional soft outer mist ring at low opacity (not candy chrome).
- No hard specular glints.

**Dial**

- Bigger SVG / container.
- Quiet face; no candy epoxy stack.
- Optional subtle frosted ring if it does not fight the progress arcs.

### 2.3 Settings

- Label: **Settings** (text, accent or ink-2).
- Placement: top left on Timer (and Urge if the header is shared).
- Action: navigate to Review → Settings hub (same as today’s Settings screen), not only the timer sheet.
- Timer alarms / notifications stay available from that hub (existing Timer settings content can be a row or nested sheet).

---

## 3. Out of scope (next pass)

- Rainbow theme
- Baby pink theme
- Army / cargo theme
- Bespoke luxury theme
- Neapolitan theme
- Custom theme from uploaded image
- Changing the default product light “quiet daylight” system beyond current light/dark/system

Keep `data-theme` light/dark/system as today until the theme pack pass.

---

## 4. Copy constraints

- Short. No pathway essays.
- Safe-first: “Cup of ice”, not chew/medical claims.
- Estimate language stays where physiology appears elsewhere; this pass does not expand cortisol copy.
- Score any new user-facing sentences against `docs/pitch.md`.

---

## 5. Acceptance checks

- Tap Urge → “What’s going on?” chips with no blurb cards
- Hungry + Meal < ~2.5h → distractions, no eat CTA
- Hungry + Meal > ~3h (or only Snack/Drink) → food ideas + Log a meal
- Distraction labels match the locked wording table
- Dial clearly larger; timer is the focus of Timer screen
- Urge orb larger; solid mint
- Start fast is ghost/outline
- Settings text top left opens full Settings
- Bottom Timer settings link removed or redirected into Settings
- No new theme pack shipped in this pass

---

## 6. Implementation notes

- Prefer extending existing `BUCKETS` / quick-action machinery over a second parallel urge system.
- Meal gate helper: `lastSubstantiveMealAt()` → latest `state.meals` (or equivalent) where `kind === 'Meal'`.
- Gate window: treat **under 2 hours** as closed; **2–3 hours** as closed; **over 3 hours** as open (use a single constant, e.g. `MEAL_GATE_MS = 3 * 3600000`, documented as “about 2–3 hours” in UI).
- Cache bump `sw.js` when shipping UI.

