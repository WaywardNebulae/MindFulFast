# Play Store listing copy

Paste-ready. Character counts are against Google Play limits.

---

## App name (30 max)

```
MindfulFast: Fasting Timer
```
25 characters.

Alternative if you want the cortisol angle in the name:

```
MindfulFast Cortisol Timer
```
26 characters.

---

## Short description (80 max)

```
Cortisol-aware fasting with sleep tracking and help when food is a stress urge.
```
73 characters.

---

## Full description (4000 max)

```
MindfulFast is an intermittent fasting timer for people whose hard days are
not only about willpower. Stress response, sleep, and food-as-coping shape
when fasting fails. The app tracks sleep and wake, slides a cortisol-day
model to your wake time, and runs a guided urge protocol with timed practices
drawn from common behavioral approaches (paced breathing, changing context,
riding out a short urge peak) when food is the coping habit.

THE TIMER

Your fasting and eating windows are drawn at their positions on a
24-hour clock, so you see your 16:8 as a proportion of the day. A
cursor marks where you are now. The countdown runs in hours and minutes,
because seconds ticking down for sixteen hours is not calming.

Protocols: 16:8, 18:6, 20:4, and one meal a day.

CORTISOL THROUGH THE DAY

Cortisol peaks shortly after waking, falls through the morning, and bottoms
out overnight. That shape affects insulin sensitivity, appetite, and how much
willpower you have in the evening. MindfulFast shows where you are on that
curve and gives guidance that changes with it: when to hold off on coffee,
when breaking a fast lands best, and when cravings are most likely.

The rhythm is anchored to when you wake rather than to the clock, so you set
your usual wake time and the whole model slides to it. A late riser does not
get told their cortisol peaked while they were asleep.

These figures are an estimate calculated from your wake time using a
population model. Nothing is measured from your body.

WHEN THE URGE HITS

Most apps hand you a list of distractions. MindfulFast asks what is driving
it first, because a stress-driven urge and hunger need different
answers.

If stress is behind it, you get a protocol rather than a list: calm your body,
move the stress out, change where you are, or soothe without food. Each one
runs a timer while you do it.

If it is not stress, you get a hunger check first, and eating a planned amount
deliberately counts as an answer, not a failure.

Then it asks how the urge changed, which is the number the log is for.

THE LOG

Every episode records the time, what happened, where you were, your mood, how
strong the urge was, how in control you felt, what you tried, and how it went.

Pattern review turns that into answers: what time of day urges cluster, which
situations and moods come up most, and which interventions reduced
your urges, measured from your own entries rather than assumed.

After a difficult episode, a short setback review asks what came before it,
what kept it going, and what you would try next time. Nothing is scored, and there is no streak to
break.

REGULAR EATING

Long gaps without food make loss-of-control eating more likely, not less. So
MindfulFast can schedule meals and snacks at a set interval and remind you.

These reminders are not subordinate to the fasting window. If a
fast is scheduled over a planned meal, the app tells you, and it says
plainly that shortening the fast will do more for urges than any breathing
exercise. A fasting timer that quietly overrode the meal plan would be
creating the problem the log is measuring.

YOUR DATA STAYS ON YOUR PHONE

No account, no sign-in, no analytics, ads, crash SDKs, tracking, or cloud sync.
Everything you log lives in storage on your device and is deleted when you
uninstall. There is no copy anywhere else, because nothing is ever sent
anywhere.

Works fully offline.

WELLNESS DISCLAIMER

MindfulFast is a wellness and self-help tool. It is not medical advice,
diagnosis, or treatment, and it does not replace a clinician. Cortisol figures
are an estimate from a population model and your wake time, not a reading from
your body.

Fasting does not suit everyone. Speak to a doctor first if you are pregnant or
breastfeeding, under 18, diabetic, take medication with food, or have a
history of disordered eating.

If eating feels out of control, or thoughts about food and weight are taking
over, a clinician trained in CBT-E can help more than any app can.
```
About 3,000 characters.

---

## Category and tags

- **Category:** Health & Fitness
- **Tags:** intermittent fasting, fasting timer, cortisol, stress eating,
  mindful eating, habit tracking
- **Contains ads:** No
- **In-app purchases:** No

---

## Content rating questionnaire

The IARC questionnaire runs through Play. Expected answers:

| Question area | Answer |
|---|---|
| Violence, sexual content, profanity, controlled substances | None |
| User-generated content shared with others | No, the log is local only |
| Does the app share the user's location | No |
| Does it allow purchases | No |
| **References to or promotion of extreme dieting or weight loss** | **Declare it.** The app covers fasting and weight |

Expect **Teen** or **Mature 17+** depending on how the dieting question is
scored. Do not target it at children. The intro screen and store description
both say 18+.

---

## Data safety form (Play Console)

Fill this so the listing shows **no data collected** and **no data shared**.

### Data collection and sharing

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **No** |
| Data shared with third parties | **No** (none collected) |
| Data processed ephemerally | Not applicable |
| Users can request deletion | Yes: uninstall or clear app storage. There is no server copy. |

### Security practices

| Question | Answer |
|---|---|
| Data encrypted in transit | **Not applicable** — no user data is transmitted |
| Users can request that data is deleted | **Yes** (local wipe via uninstall / clear storage) |

### Explicit “no” checklist (confirm each)

- No analytics / advertising ID collection
- No crash or diagnostics SDKs
- No cloud sync or account systems
- No location collection for ads or analytics
- No sale of user data

### Ads

- **Contains ads:** No

### Optional push helper (must stay off by default)

The in-app optional push server is **disabled unless the user pastes a URL**.
With that default, Data safety stays **No data collected / No data shared**.
If you ever ship it on by default, revisit this form before release.

---

## Privacy policy URL

Required for every Health app.

```
https://nebulaelabs.dev/privacy.html
```

Published automatically by the Pages workflow.

---

## Assets checklist

| Asset | Requirement | File |
|---|---|---|
| App icon | 512x512 PNG, 32-bit | `../icons/icon-512.png` |
| Feature graphic | 1024x500 PNG | `feature-graphic.png` |
| Phone screenshots | 2 to 8, max 2:1 ratio | `play-*.png` (1080x1920) |
| Tablet screenshots | Optional | not supplied |

**Upload the `play-` files, not the `screen-` ones.** The raw captures are
`screen-*.png` at 780x1688, which is 2.16:1 and taller than Play's 2:1 cap.
The `play-` versions pad those onto the app's own background to a standard
9:16, with no upscaling and nothing cropped. The `screen-` files stay because
the web manifest references them and has no such ratio limit.

Play sometimes asks for a 7-inch and 10-inch tablet screenshot to list on
tablets. The layout is capped at 480px wide and centres on larger screens, so
a tablet capture will show wide empty margins. If you want tablet listings,
either take that as-is or opt out of tablet distribution.
