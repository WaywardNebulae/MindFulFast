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
A fasting timer built on your cortisol rhythm, with real help for eating urges.
```
78 characters.

---

## Full description (4000 max)

```
MindfulFast is an intermittent fasting timer built around two things most
fasting apps ignore: the daily cortisol rhythm that shapes when eating feels
easy or hard, and what to actually do when the urge to eat arrives.

A DIAL, NOT A PROGRESS BAR

Your fasting and eating windows are drawn at their real positions on a
24-hour clock, so you see your 16:8 as a proportion of the actual day. A
cursor marks where you are now. The countdown runs in hours and minutes,
because seconds ticking down for sixteen hours is not calming.

Protocols: 16:8, 18:6, 20:4, and one meal a day.

CORTISOL THROUGH THE DAY

Cortisol peaks shortly after waking, falls through the morning, and bottoms
out overnight. That shape affects insulin sensitivity, appetite, and how much
willpower you have in the evening. MindfulFast shows where you are on that
curve and gives guidance that changes with it: when to hold off on coffee,
when breaking a fast lands best, and when cravings are most likely.

These figures are an estimate calculated from the time of day using a
population model. Nothing is measured from your body.

WHEN THE URGE HITS

Most apps hand you a list of distractions. MindfulFast asks what is driving
it first, because a stress-driven urge and actual hunger need different
answers.

If stress is behind it, you get a protocol rather than a list: calm your body,
move the stress out, change where you are, or soothe without food. Each one
runs a timer while you do it.

If it is not stress, you get a hunger check first, and eating a planned amount
deliberately is treated as a real answer rather than a failure.

Then it asks how the urge changed. That is the part that makes the log worth
keeping.

A LOG THAT TELLS YOU SOMETHING

Every episode records the time, what happened, where you were, your mood, how
strong the urge was, how in control you felt, what you tried, and how it went.

Pattern review turns that into answers. What time of day urges cluster. Which
situations and moods come up most. And which interventions actually reduced
your urges the most, measured from your own entries rather than assumed.

After a difficult episode, a short setback review asks what came before it,
what kept it going, and what you would try next time. No scoring, no streak to
break.

REGULAR EATING

Long gaps without food make loss-of-control eating more likely, not less. So
MindfulFast can schedule meals and snacks at a set interval and remind you.

These reminders are deliberately not subordinate to the fasting window. If a
fast is scheduled over a planned meal, the app tells you, and it says
plainly that shortening the fast will do more for urges than any breathing
exercise. A fasting timer that quietly overrode the meal plan would be
creating the problem the log is measuring.

YOUR DATA STAYS ON YOUR PHONE

No account. No sign-in. No analytics, ads, or tracking. Everything you log
lives in storage on your device and is deleted when you uninstall. There is no
copy anywhere else, because nothing is ever sent anywhere.

Works fully offline.

WHAT THIS IS NOT

MindfulFast is a self-help tool, not medical advice, diagnosis, or treatment.
Fasting does not suit everyone. Speak to a doctor first if you are pregnant or
breastfeeding, under 18, diabetic, take medication with food, or have a
history of disordered eating.

If eating feels out of control, or thoughts about food and weight are taking
over, a clinician trained in CBT-E can help more than any app can.
```
About 2,900 characters.

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

## Data safety form

The strongest position an app can have here, so fill it in exactly:

- **Does your app collect or share any of the required user data types?**
  **No.**
- **Is all of the user data collected by your app encrypted in transit?**
  Not applicable, no data is transmitted.
- **Do you provide a way for users to request that their data is deleted?**
  Yes: uninstalling, or clearing app storage, deletes everything. There is no
  server copy.

If, and only if, you ship the optional push server enabled by default, this
changes: you would then be transmitting a push endpoint and alarm times, and
would have to declare it. Shipping it off by default, as it is now, keeps the
answer a clean No.

---

## Privacy policy URL

Required for every Health app.

```
https://waywardnebulae.github.io/MindFulFast/privacy.html
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
