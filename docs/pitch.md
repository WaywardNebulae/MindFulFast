# MindfulFast — Product Pitch

**Company:** Nebulae Labs  
**Product:** MindfulFast  
**Platform:** Android (Google Play), one-time paid download  
**Package ID:** `com.nebulaelabs.mindfulfast`  
**Support:** hello@nebulaelabs.dev  
**Site (marketing / privacy only):** https://nebulaelabs.dev  
**Category:** Health & Fitness  

---

## One-line pitch

A cortisol-aware fasting timer with sleep/wake tracking and a science-informed urge protocol for when food is a stress response — pay once, data stays on your phone.

## The problem

Most fasting apps treat the hard part as a willpower problem and sell a countdown timer on a subscription ($50–70/year is common). That misses why people break fasts and overeat in the first place.

**It is not only willpower.**

1. **Stress response.** Cortisol and stress physiology shape appetite, cravings, and “I need something now.” A timer that ignores stress asks people to white-knuckle a biological state.
2. **Sleep.** Short or shifted sleep messes with hunger hormones, impulse control, and next-day cortisol timing. If the app’s day model assumes everyone wakes at 7 and never asks about sleep, the guidance is wrong for a large share of users.
3. **Food as coping.** A lot of people use food to regulate emotion, not only to answer hunger. Distraction lists alone are thin. What helps more are structured alternatives drawn from behavioral work (urge surfing, paced breathing, changing context, planned eating when it is hunger) — methods studied in stress and eating-behavior research, used here as wellness tools, not as therapy.
4. **Time of day.** Appetite and willpower are not flat across 24 hours. The daily cortisol rhythm is one reason evenings are harder for many people.

On top of that, big apps push accounts, ads, and cloud health data. People who want a private tool get a sales funnel instead.

## The product

MindfulFast is a self-contained Android app: timer, sleep/wake tracking, cortisol guidance, urge protocol, eating log, patterns, and regular-eating reminders. Built as a calm wellness tool, not a clinical instrument and not a gamified streak machine.

**Monetization:** one-time Play purchase. No subscription. No in-app purchases in v1. No ads.

---

## What it does

### 1. 24-hour fasting dial

- Fasting and eating windows drawn at real clock positions (not a generic progress ring).
- Outer ring = fast; inner thinner ring = eating window.
- Cursor shows “now.”
- Idle: drag the ring to set start time.
- Protocols: **16:8, 18:6, 20:4, OMAD**.
- Countdown in **hours and minutes** (no seconds — less anxiety for a 16-hour fast).
- Face shaded across the cortisol **low band** (same math as the Cortisol screen).

### 2. Eating log (drives the timer)

Logging food updates the fast; you do not have to remember a separate “end” tap for every edge case.

- Log a meal → fast ends; eating window opens from that time.
- Meal earlier than fast start → fast adjusts (you were not fasting before you ate).
- Next fast counts from last meal (overridable).
- Planned meals from regular eating write the same record.
- Entries: meal / snack / drink, time, optional note.

### 3. Sleep and wake

- Usual bedtime and usual wake time (wake anchors the cortisol day model).
- Log last night: bed time, wake time, optional quality (poor / OK / good).
- Duration calculated across midnight; recent nights kept locally.
- Short sleep is called out in plain language as a common amplifier of next-day urges — wellness framing, not a diagnosis.

### 4. Cortisol through the day

- Population-model curve of daily cortisol rhythm.
- Anchored to **wake time** (default 07:00), not fixed to “everyone wakes at 7.”
- Guidance shifts with the curve: coffee, break-fast timing, craving windows.
- Reading also considers recent eating (same clock hour means different things after a meal vs deep in a fast).
- **Honest limit:** estimate from wake time + model. Nothing measured from the body. Not a clinical reading.

### 5. Urge protocol (food as coping)

Guided flow when the urge to eat shows up — built for stress-driven eating as well as hunger:

- Asks cause first — stress vs not-stress need different responses.
- **Stress path:** calm the body (paced breathing), move the stress out, change context, or soothe without food — each with a timed practice. These are common behavioral strategies used in stress and urge management (e.g. longer exhales for down-regulation, stimulus control, urge surfing / riding out a peak that often fades in 15–20 minutes). Presented as self-help, not therapy.
- **Non-stress path:** hunger check; planned eating can count as handling the urge (not framed as failure).
- Records how the urge changed afterward (feeds Patterns).
- Breathing: 4 in, hold, 6 out, hold (longer out-breath).

### 6. Episode log + setback review

Per episode: time, what happened, place, mood, urge strength, sense of control, what was tried, outcome, notes.

After hard episodes: short setback review (what came before, what kept it going, what to try next). No score. No streak punishment.

### 7. Patterns

From the user’s own entries:

- When urges cluster by time of day  
- Common situations and moods  
- Which interventions reduced urge intensity  

### 8. Regular eating

Optional meal/snack schedule + reminders.

- Long gaps without food raise loss-of-control risk; the app does not hide that.
- If a fast conflicts with a planned meal, the app says so.
- Pattern review can recommend shortening the fast when urges follow long gaps.

### 9. Alarms / notifications

On-device schedule for fasting and meal reminders. Exact delivery depends on platform support. Optional self-hosted push helper exists in the repo but is **off by default** and not part of normal paid use.

---

## Privacy and trust

| Claim | Detail |
|--------|--------|
| No account | No sign-in |
| No analytics | None |
| No ads | None |
| No crash SDKs | None |
| No cloud sync | Local storage only |
| Deletion | Uninstall or clear app storage; no server copy |

Play Data safety position: **no data collected, no data shared** (while optional push stays off by default).

---

## Wellness framing (not medical claims)

MindfulFast is a **wellness / self-help** tool.

- Not medical advice, diagnosis, or treatment.
- Cortisol figures are a population-model estimate from wake time.
- Fasting is not for everyone (pregnancy, under 18, diabetes, meds with food, disordered eating history — talk to a doctor).
- If eating feels out of control, a CBT-E clinician beats any app.

---

## Design

**Direction:** quiet daylight — calm health tool, book-like type, not a dark “instrument panel.”

- Fonts: Literata (display/timer) + Figtree (UI), self-hosted.
- One brand accent (sea-glass teal); scarce use.
- Structure over decoration: no card grids, no icon-tab clutter, no streak theater.
- Light primary; dark for evening use.

Brand mark: soft-fill leaf; Play icons use a candy-forward epoxy treatment on theme tiles. In-app header stays minimal stroke leaf. Cold-start: quiet pulse loading on full reopen only.

---

## Business model

| Item | Choice |
|------|--------|
| Store | Google Play |
| Price model | One-time paid app |
| Suggested launch price | **$9.99 USD** (band $7.99–$12.99) |
| IAP / subscriptions | None in v1 |
| Free full web app | No — undercuts paid Play |
| Public web | Landing + privacy (+ contact); not the runnable product |

**Why pay-once works here:** competitors charge yearly for timers; MindfulFast sells a clearer job (cortisol timing + urge protocol + local privacy) without a recurring bill.

---

## Distribution and tech

| Layer | Choice |
|--------|--------|
| App UI | Vanilla HTML / CSS / JS (single `index.html` core) |
| Android shell | Capacitor; bundled assets in the binary |
| Application ID | `com.nebulaelabs.mindfulfast` |
| Signing | Upload keystore + Play App Signing |
| Artifact | Release `.aab` |
| Marketing site | Separate private repo on nebulaelabs.dev (Stellar); after app ship |
| Retired for paid v1 | TWA / Bubblewrap as the commercial path |

---

## Competitive position

| Typical fasting app | MindfulFast |
|---------------------|-------------|
| Progress ring + streaks | 24h dial + cortisol low sector |
| Willpower / distraction list | Stress-aware protocol + timed practices + measured outcomes |
| Ignores sleep | Sleep/wake log tied to the day model |
| Subscription / account | Pay once, local only |
| Fixed “morning” tips | Wake-anchored cortisol model |
| Fast overrides everything | Regular eating can take priority |

Not trying to beat Zero on content libraries or social. Wins on **privacy, stress/coping support, sleep-aware timing, and time-of-day honesty**.

---

## Go-to-market (v1)

1. Ship paid Android app (Internal → Closed test → Production as Play rules require).  
2. Listing leads with urge + cortisol + local data.  
3. Support: hello@nebulaelabs.dev.  
4. Privacy URL on nebulaelabs.dev (HTTPS).  
5. Marketing site later (private repo): landing, privacy, Play link — not a free full app.

---

## Traction / status (internal)

- Product UI and core flows implemented.
- Privacy policy + wellness disclaimer in place.
- Capacitor packaging path in progress; upload keystore and release `.aab` produced (credentials held offline).
- Play Console listing / closed testing still to complete.
- Nebulae Labs marketing site: deferred to its own private repo.

---

## Ask (for partners / self)

Ship MindfulFast as Nebulae Labs’ first paid Play app: a focused fasting tool people own forever, with urge support and cortisol-aware timing, without selling their data or locking features behind a subscription.

---

## Contact

- **Web:** https://nebulaelabs.dev  
- **Email:** hello@nebulaelabs.dev  
- **Privacy:** https://nebulaelabs.dev/privacy.html  
