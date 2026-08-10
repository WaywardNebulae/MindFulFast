# MindfulFast

An intermittent fasting timer that uses the daily cortisol rhythm, with a
guided routine for handling the urge to eat.

**[Open the app](https://nebulaelabs.dev/)**

Installable as a phone app. Works offline. Everything you log stays in storage
on your device.

---

## What it does

### Timer

A 24-hour dial rather than a progress bar. Your fasting and eating windows are
drawn at their real positions on the clock, so you read 16:8 as a proportion of
the actual day. The fast is the outer ring, the eating window its own thinner
ring inside it. A cursor marks where you are now, and the ring is draggable, so
you can set a start time instead of accepting the moment you opened the app.

The face is shaded across the hours where cortisol sits in its low band, which
is why the dial is not symmetrical. Urges are more common in those hours. The
bounds are calculated from the same curve the Cortisol screen plots, so the two
cannot disagree.

Protocols: 16:8, 18:6, 20:4, and one meal a day.

The countdown shows hours and minutes. Seconds are left off deliberately,
since watching them tick for sixteen hours makes most people more anxious.

### Eating log

What you ate and when. The timer reads off it, so it does not depend on you
remembering to press anything:

- Logging a meal ends the fast at that moment and opens the eating window
  from there, whatever the countdown still says.
- Log a meal earlier than the fast start and the fast moves to it, because you
  cannot have been fasting since before you ate.
- The next fast counts from your last meal rather than from when you tapped
  start. The dial says which time it is using and lets you override it.
- Ticking off a planned meal in regular eating writes the same record, so the
  two never disagree.

Each entry keeps the time and whether it was a meal, a snack, or a drink. You
can add a note.

### Cortisol

Cortisol peaks shortly after waking, falls through the morning, and bottoms out
overnight. That shape affects insulin sensitivity, appetite, and how much
willpower is left in the evening.

The rhythm is anchored to when you wake rather than to the clock, so the
Cortisol screen takes your usual wake time and slides the whole model to it.
Set it to 10:30 and your peak moves to 11:30, the low band and the dial's
shaded sector move with it, and the suggested meal times move too. It defaults
to 7am, which is the curve the app used before this was configurable.

The app shows where you are on that curve and changes its guidance with it:
when to hold off on coffee, when to break a fast, and when cravings are more
likely.

The guidance reads against your eating log too, since the same reading means
something different an hour after a meal than it does sixteen hours after one.

These figures are an estimate calculated from the time of day using a
population model. Nothing is measured from your body.

### Urge

A guided sequence rather than a list of distractions. It asks what is causing
the urge first, because stress and hunger need different responses.

If stress is causing it, you choose between four approaches: calm your body,
use up the adrenaline, change where you are, or comfort yourself another way.
Each one runs a timer.

If stress is not causing it, you get a hunger check first. Eating a planned
amount on purpose is recorded as handling the urge.

It then asks how the urge changed. That number is what the pattern review uses.

The breathing exercise is four in, hold, six out, hold. The long out-breath is
what lowers your heart rate.

### Log

Every episode records the time, what happened, where you were, your mood, how
strong the urge was, how in control you felt, what you tried, and how it went.

After a difficult episode a short setback review asks what came before it, what
kept it going, and what you would try next time. Nothing is scored, and there
is no streak to break.

### Patterns

What time of day urges cluster, which situations and moods come up most, and
which interventions actually reduced your urges, ranked by measured drop from
your own entries.

### Regular eating

Long gaps without food make loss-of-control eating more likely, not less. So
the app can schedule meals and snacks at a set interval and remind you.

These reminders take priority over the fasting window. If a fast is scheduled
over a planned meal the app says so, and pattern review will tell you to
shorten the fast when urges follow long gaps. A fasting timer that overrode the
meal plan would be causing the problem the log is there to measure.

---

## Alarms

A web page cannot run code on a timer once it is closed, so alarms use several
mechanisms depending on what the browser supports.

The schedule lives in IndexedDB and the service worker fires anything due on
every wake-up it gets. Where the browser supports scheduled notification
triggers, delivery is exact. Otherwise an alarm arrives on the browser's next
wake and states how late it is.

`server/` holds an optional push scheduler for exact delivery to a closed app.
It is off by default and needs a host you run yourself. See `server/README.md`.

---

## Privacy

No account, no sign-in, no analytics, no ads, no tracking. Nothing is sent
anywhere. Uninstalling or clearing site data deletes everything, and there is no
copy elsewhere to recover.

Full detail in [privacy.html](https://nebulaelabs.dev/privacy.html).

---

## This is not medical advice

MindfulFast is a self-help tool. It is not medical advice, diagnosis, or
treatment.

Fasting does not suit everyone. Speak to a doctor first if you are pregnant or
breastfeeding, under 18, diabetic, take medication with food, or have a history
of disordered eating.

If eating feels out of control, or thoughts about food and weight are taking
over, a clinician trained in CBT-E can help more than any app can.

---

## Development

Plain HTML, CSS, and JavaScript. No build step, no framework, no dependencies.

```
index.html      the whole app
sw.js           service worker: offline cache and alarm delivery
manifest.json   PWA manifest
privacy.html    privacy policy
fonts/          Literata and Figtree, subset, self-hosted
icons/          app icons
store/          Play listing assets and copy
server/         optional push scheduler
DESIGN.md       the design constraint set
```

To run it locally:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. A service worker needs `localhost` or HTTPS,
so opening `index.html` as a file will not exercise offline behaviour.

The site publishes from the `gh-pages` branch. The live URL is
**https://nebulaelabs.dev/** (`CNAME` in the repo root).

### Custom domain (GitHub Pages)

1. In the repo: *Settings → Pages → Custom domain* → `nebulaelabs.dev`
2. At your DNS host, point the domain at GitHub Pages (typical for apex):
   - `A` records to GitHub's Pages IPs, or
   - `CNAME` for `www` to `WaywardNebulae.github.io` if you use www
3. Turn on **Enforce HTTPS** once the certificate is ready
4. Publish Digital Asset Links at
   `https://nebulaelabs.dev/.well-known/assetlinks.json`
   (see `store/assetlinks-README.md`)

Until DNS and Pages are linked, the old
`waywardnebulae.github.io/MindFulFast/` URL may still work as a fallback.

---


## Design

`DESIGN.md` holds the constraints and the reasoning. One painted background,
sections separated by space and hairlines instead of cards, text actions
instead of filled blocks. Every colour that carries text measures at least
4.5:1 against its background, and the dial's track measures 3:1.

Literata sets headings and the timer, Figtree sets the interface. There is no
monospace anywhere, which changed the feel of the app more than any palette
change did. Light is the primary theme. Dark is included because most people
using this app will need it in the evening.

---

## Licence

App code is MIT.

Literata and Figtree are used under the SIL Open Font License 1.1.
See `fonts/OFL.txt`.
