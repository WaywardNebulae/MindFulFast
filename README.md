# MindfulFast

An intermittent fasting timer built around two things most fasting apps leave
out: the daily cortisol rhythm that shapes when eating feels easy or hard, and
what to actually do when the urge to eat arrives.

**[Open the app](https://waywardnebulae.github.io/MindFulFast/)**

Installable as a phone app. Works offline. Everything you log stays in storage
on your device.

---

## What it does

### Timer

A 24-hour dial rather than a progress bar. Your fasting and eating windows are
drawn at their real positions on the clock, so you read 16:8 as a proportion of
the actual day. A cursor marks where you are now, and graduations run every two
hours.

Protocols: 16:8, 18:6, 20:4, and one meal a day.

The countdown is hours and minutes. Seconds ticking down for sixteen hours is
not calming.

### Cortisol

Cortisol peaks shortly after waking, falls through the morning, and bottoms out
overnight. That shape affects insulin sensitivity, appetite, and how much
willpower is left in the evening.

The app shows where you are on that curve and changes its guidance with it:
when to hold off on coffee, when breaking a fast lands best, when cravings are
most likely.

These figures are an estimate calculated from the time of day using a
population model. Nothing is measured from your body.

### Urge

A guided protocol, not a list of distractions. It asks what is driving the urge
first, because stress and hunger need different answers.

If stress is behind it, you get four directions: calm your body, move the
stress out, change where you are, or soothe without food. Each runs a timer
while you do it.

If it is not stress, you get a hunger check first, and eating a planned amount
deliberately is offered as a real answer rather than a smaller kind of failure.

Then it asks how the urge changed. That is what makes the log worth keeping.

Breathing is four in, hold, six out, hold. The longer exhale is the part that
lowers arousal.

### Log

Every episode records the time, what happened, where you were, your mood, how
strong the urge was, how in control you felt, what you tried, and how it went.

After a difficult episode a short setback review asks what came before it, what
kept it going, and what you would try next time. No scoring, no streak to break.

### Patterns

What time of day urges cluster. Which situations and moods come up most. And
which interventions actually reduced your urges, ranked by measured drop from
your own entries rather than assumed.

### Regular eating

Long gaps without food make loss-of-control eating more likely, not less. So
the app can schedule meals and snacks at a set interval and remind you.

These reminders are deliberately **not** subordinate to the fasting window. If a
fast is scheduled over a planned meal the app says so, and pattern review will
tell you to shorten the fast when urges follow long gaps. A fasting timer that
quietly overrode the meal plan would be creating the problem the log measures.

---

## Alarms

A web page cannot run code on a timer once it is closed, so alarm delivery is
layered by what the platform actually allows.

The schedule lives in IndexedDB and the service worker fires anything due on
every wake-up it gets. Where the browser supports scheduled notification
triggers, delivery is exact. Otherwise an alarm arrives on the browser's next
wake and says how late it was rather than pretending to be on time.

`server/` holds an optional push scheduler for exact delivery to a closed app.
It is off by default and needs a host you run yourself. See `server/README.md`.

---

## Privacy

No account, no sign-in, no analytics, no ads, no tracking. Nothing is sent
anywhere. Uninstalling or clearing site data deletes everything, and there is no
copy elsewhere to recover.

Full detail in [privacy.html](https://waywardnebulae.github.io/MindFulFast/privacy.html).

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
fonts/          IBM Plex Sans and Mono, subset, self-hosted
icons/          app icons
store/          Play listing assets and copy
server/         optional push scheduler
DESIGN.md       the design constraint set
store/          Play listing assets and copy
```

To run it locally:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. A service worker needs `localhost` or HTTPS,
so opening `index.html` as a file will not exercise offline behaviour.

The site publishes from the `gh-pages` branch.

---

## Design

`DESIGN.md` holds the locked constraints and the reasoning. In short: one
painted background, separation by rules and spacing rather than cards, text
actions instead of filled blocks, and contrast measured rather than eyeballed.
Dark only, as a deliberate choice.

---

## Licence

App code is MIT.

IBM Plex Sans and IBM Plex Mono are used under the SIL Open Font License 1.1.
See `fonts/OFL.txt`.
