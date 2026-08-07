# MindfulFast, Design System

**Direction: instrument panel.** A chronometer for a physiological process.
Not a dashboard, not a wellness app, not a landing page. The screen is a
calibrated face you read, and the controls sit quietly around it.

This file is the constraint set. Check work against it before calling a
screen done. Three earlier passes failed by re-skinning the same skeleton
with a new palette, the palette was never the problem. **The structure is
the design.**

---

## What failed before, so it does not come back

| Attempt | Palette | Why it read as generic |
|---------|---------|------------------------|
| 1 | cream / sage / amber | Exactly the documented AI-design tell |
| 2 | blue / gray | Relocated to a different safe palette, identical structure |
| 3 | monochrome + semantic | Absence of a direction is not a direction |

All three shared: centred ring widget, chip row, full-width filled button,
a stack of visually identical `label + content` sections, 4-tab Lucide icon
nav. **That skeleton is the slop.** Changing hexes never touched it.

---

## Palette

Dark ground is a deliberate, stated choice (requested), not a reflex.
There is no light theme, committing fully beats supporting both badly.

| Token | Value | Role |
|-------|-------|------|
| `--ground` | `#0E1116` | The one and only surface |
| `--lift` | `#191E26` | Transient overlays only. Never layout. |
| `--ink` | `#EAEDF2` | Primary text |
| `--ink-2` | `#B6BEC9` | Body prose, secondary. 10.1:1 |
| `--ink-3` | `#939BA7` | Smallest text allowed. 6.7:1 |
| `--grad` | `#555F6D` | Dial graduations. Non-text only. |
| `--rule` | `#363E4A` | Item separators (~1.8:1) |
| `--rule-strong` | `#49525F` | Region boundaries (~2.4:1) |
| `--accent` | `#5AA894` | The only brand hue. 6.5:1. |
| `--accent-dim` | `rgba(90,168,148,.28)` | Unelapsed fast window |
| `--crit` | `#E0736B` | Semantic only: avoid / gave in / end fast |

Three active hues: ground (dominant), ink scale (neutral), accent (~10%
coverage). `--crit` is semantic and kept out of the brand system.

**Rejected on purpose:** brass/gold (the brief names near-black-and-gold as
a relocation trap), sage (same), Tailwind blue (attempt 2), any purple.
The accent is a desaturated medical teal, a monitor trace, tied to the
content rather than picked for taste.

**No semantic traffic light.** Cortisol is a *magnitude*, so it is encoded
by position on a graduated scale and by the word itself, not by green /
amber / red. That removed two hues from the system.

---

## Type

Real pairing, shipped as local woff2 (OFL, cached by the service worker):

- **IBM Plex Sans** 400/500/600, all prose, labels, headings, nav, counts
- **IBM Plex Mono** 400/500, time, clock values, protocol names, axis labels

The split is a rule, not a mood: **mono means a time or a measured value.**
Counts (streak, totals) are sans, they are not clock values.

- Body prose ≥ 16px. Smallest text 13px, `--ink-3` only.
- **The ink ladder is measured, not eyeballed: 16.1 / 10.1 / 6.7 against the
  ground.** An earlier pass had `--ink-3` at 4.7:1 carrying nearly all the
  secondary text at 12 to 14px. It cleared AA on paper and still read as
  faint. Keep real gaps between the three steps, and check a render rather
  than trusting the token name.
- Hierarchy from size and weight. Never italic display, never tracked-out
  caps, never all-caps micro-labels.
- Section labels: 13px / 500 / `--ink-3` / sentence case / no tracking.

---

## Structure

**One painted background.** Verify on the render, not the stylesheet:

```js
[...document.querySelectorAll('#app *')].filter(n => {
  const bg = getComputedStyle(n).backgroundColor;
  return bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent'
      && bg !== getComputedStyle(document.body).backgroundColor;
});
```

Current result: toggle tracks and knobs (control affordances), 2px meal
bars (data encoding), and the hidden toast. **Zero container frames.**
Anything that is a *box around content* is a regression.

- Regions separated by `--rule-strong` + 26px padding. Items by `--rule`.
- No cards, panels, wells, tiles, chips, or bento grids.
- Grids draw internal separators only, an outer border rebuilds the frame.
- Inputs are underlines (2px bottom border), never boxes.

### Section weight must vary

Squint at a thumbnail. If every band reads as the same gray block it is
slop, not consistency.

`.band` has `tight` and `airy` variants: dense numeric readouts sit tight,
controls and prose get room. Four sections at identical padding is what made
this read as one repeated template.

The timer screen runs: **dial (huge, centred) → action (bright thin line) →
readout (dense single row) → prose → tabular numerics → roomy controls.**
Six distinct weights.

---

## The dial

A 24-hour clock face, midnight at top, clockwise. The fasting and eating
windows are arcs at their **actual clock positions**, so the ring is always
complete and splits into two visibly different segments, you read your
16:8 as a proportion of the real day.

- Ring `r=130` stroke 6. Fast = accent (elapsed) over `--accent-dim`
  (remaining). Eat = `--ink-3` over `--rule-strong`.
- Cursor crosses the ring (`r` 121→139) so it reads as a marker on a scale,
  never a hand floating outside it.
- Graduations every 2h, longer at the quarters, with `12a / 6a / 12p / 6p`.
- Countdown is **HH:MM**. Seconds ticking is anxious, and minutes are the
  right unit for a 16-hour fast.

**Cut during review:** a cortisol ribbon plotted radially inside the dial.
A smooth unimodal curve in polar coordinates just looks like another
circle, it competed with the window ring and carried no information the
sparkline already carries better. Decoration that argues it is data is
still decoration.

Note for future edits: `cortisolAt()` is piecewise. Every branch must meet
its neighbour at the boundary or the curve grows a spike (this happened at
hour 14).

---

## Controls

**Primary action is text, never a filled block.** A filled rectangle is a
genre marker before it is a button; it imports landing-page grammar. `Start
fast` is accent text at 20px weight 600 between two rules, and it is the
only accent in its region. Primacy comes from scarcity, not fill.

It also carries the 2px accent underline that marks every other active
thing in the app. Text alone read as informational rather than tappable;
reusing the existing active-state grammar fixes that without a fill.

- Protocol selection: text only. Active = accent + 2px underline.
- `End fast` uses `--crit`, a genuine state change, not decoration.
- Nav is **text labels** with a 2px accent tab indicator. No icon set:
  stock Lucide glyphs are their own tell.
- Toggles keep a track and knob, they are real affordances.
- Text controls pad then pull back (`padding: 12px; margin: 0 -12px`) so the
  44px target exists without breaking column alignment.
- Every state designed: hover (1px underline at 6px offset), `:focus-visible`
  (2px accent ring), active, disabled, empty.

## The urge flow

A guided sequence, not a screen. It takes over the viewport as a
mutually exclusive surface (Procedure 1 step 3), with its own header
carrying `step / total` in mono and a footer holding Back and the primary
action. Nothing inside it is a card.

- Selections are text with a 2px accent underline when chosen, the same
  grammar as the protocol selector. Never a filled chip.
- Intensity is a 0 to 10 graduated scale: eleven cells sharing a rule along
  the top, the chosen one lifting to accent. It reads as a gauge, which is
  the house language, and avoids a native slider's box.
- Choosing a direction or an action advances immediately. Someone mid-urge
  should not have to hunt for Next after making a decision.
- Requirements stay light. A half-filled entry is worth more than an
  abandoned one, so only the ratings and the outcome gate progress.

**Options carry values in `data-set` / `data-val`, read by one delegated
listener.** Interpolating a label into an inline `onclick` breaks the moment
it contains a quote or apostrophe, which silently dropped three fields
before it was caught on a render.

## Regular eating

CBT-E puts regular eating early because long gaps without food drive
loss-of-control episodes. So meal slots are not subordinate to the fasting
window: their reminders fire whether or not a fast is running, and when the
fast is scheduled over a planned meal the app says so in `--crit` rather
than letting the fast quietly win.

Pattern review carries the matching honesty: if episodes cluster after long
gaps, it says restriction is the thing to change, not the urge tooling.

## Motion

Functional only: the arc sweeps, the cursor advances, the breathing ring
scales. No fades on load, no glow, no parallax. `prefers-reduced-motion`
collapses all transitions.

## Never

Emoji anywhere in the UI. Gradients. Shadows. Glassmorphism. Stock icons.
Italic serif display. Tracked-out caps. A second painted surface.
