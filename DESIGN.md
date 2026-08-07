# MindfulFast, Design System

**Direction: quiet daylight.** A calm health tool. Air, soft contrast between
surfaces, and type that reads like a book rather than a readout.

This file is the constraint set. Check work against it before calling a
screen done. **The structure is the design**, not the palette.

---

## What failed before

| Attempt | Why it read wrong |
|---------|-------------------|
| 1 | cream / sage / amber, the documented AI-design tell |
| 2 | blue / gray, a different safe palette, identical structure |
| 3 | monochrome, absence of a direction is not a direction |
| 4 | dark instrument panel, precise but cold and clinical |

Attempts 1 to 3 all shared one skeleton: centred ring widget, chip row,
full-width filled button, identical stacked sections, icon tab bar. Changing
hexes never touched it.

Attempt 4 fixed the structure and was genuinely coherent, but the mood was
wrong for the job. Monospace everywhere, tight rhythm and a cold blue-black
ground read as a machine readout. This app is used by someone trying to
settle, so it should feel settled.

**Mono is gone entirely.** It was the single biggest thing making the app feel
clinical, and removing it did more for calm than any palette change.

---

## Palette

Light is the primary, deliberate choice. Dark is paired rather than reflexive:
the hardest moments this app exists for happen in the evening.

| Token | Light | Dark | Role |
|-------|-------|------|------|
| `--ground` | `#F3F5F4` | `#0F1720` | The page |
| `--surface` | `#FBFCFB` | `#16212B` | Earns its place twice only |
| `--ink` | `#162128` | `#E6EEF2` | Primary text |
| `--ink-2` | `#5F7078` | `#9FB0BC` | Prose, secondary |
| `--line` | `#D7DFDB` | `#22303B` | Hairlines, used sparingly |
| `--accent` | `#37776C` | `#6FC3B2` | The one brand hue |
| `--accent-soft` | 30% | 32% | Unelapsed fast window, must read as data |
| `--wash` | 12% | 14% | Selected chips, never a solid fill |
| `--success` | `#3E7F45` | `#7BC47F` | Completed |
| `--warn` | `#8A5F28` | `#D8A56D` | Missed |
| `--crit` | `#A8443C` | `#E08C84` | End fast, lapse |

The light accent arrived as `#4E9C90`, which measures 3.0:1 on the ground and
fails for the primary action text. Darkened to `#37776C` at 4.8:1, keeping the
sea-glass character.

**Two painted surfaces, not zero.** Earlier passes targeted an empty array.
This one deliberately allows `--surface` in exactly two places: the single
Right now card, and overlay sheets. That is the doc's own second option, a
3 to 5% lightness shift, and it buys the hierarchy the flat version lacked.
Anywhere else is a regression. Verified on the render: the only painted
elements are `.rightnow` and the sheet.

Ground is a pale cool paper with no yellow cast, so it is not the cream tell.
Ink is a deep pine rather than pure black. One accent, a deep teal-green,
sitting at roughly 10% coverage.

Contrast is measured, not eyeballed. Light: 15.2 / 6.5 / 4.9 against the
ground. Dark: 14.9 / 8.8 / 5.8. An earlier pass shipped an `--ink-3` at 4.0:1
that read as faint, so check a render rather than trusting a token name.

---

## Type

Real pairing, shipped as local woff2 (OFL, cached by the service worker):

- **Literata** 400/500, display: headings, the timer, large numerals
- **Figtree** 400/500/600, everything else: UI, labels, prose, data

Literata is a screen reading face, warm and sturdy without display drama. No
italic serif tricks, no tracked-out caps. Figtree carries the interface and
handles all numerics with `font-variant-numeric: tabular-nums`.

- Body prose ≥ 16px, line-height 1.6. Smallest text 14px.
- Hierarchy from size, weight and space. Never from novelty.
- Section labels: 14px / 500 / `--ink-3` / sentence case / no tracking.

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

## Rhythm of the home screen

Dial, then one action, then one live card, then the day. Everything else is
quieter than those four. Sections are separated by space rather than a rule on
every band, which is what made the previous pass read as uniformly important.

## Microinteractions

Every action gets one visible response. All of them ease on
`cubic-bezier(0.32, 0.72, 0, 1)` and collapse under `prefers-reduced-motion`.

- Nav indicator glides between tabs rather than cutting.
- Primary action scales to 0.97 and shifts to `--accent-press` while held.
- Timeline rows ripple from the touch point, then flip their dot to success.
- The Right now card presses in and opens a bottom sheet.
- The dial arc animates its sweep; state words cross-fade.
- The ring is draggable while idle. A handle sits on the arc, swells with a
  soft halo under the finger, and previews the whole window live.

**The scrub preview is in-memory only.** Persisting it would let a stale
choice survive a reload and quietly shift a real fast. It resets on commit and
on any protocol change, and the handle is absent whenever a fast is running,
because the start time is no longer yours to choose.

## The dial

A 24-hour clock face, midnight at top, clockwise. The fasting and eating
windows are arcs at their **actual clock positions**, so the ring is always
complete and splits into two visibly different segments, you read your
16:8 as a proportion of the real day.

- Ring `r=130` stroke 5, **butt caps**. Round caps leave a visible dot at
  every arc end and read as debris. Fast = accent (elapsed) over `--accent-soft`
  (remaining). Eat sits at stroke 3 so it is clearly subordinate.
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
