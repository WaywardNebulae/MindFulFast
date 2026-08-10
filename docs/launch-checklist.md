# MindfulFast launch checklist

Master list for finishing the app and shipping to Play.  
**Website (`nebulaelabs.dev` marketing site) = separate private repo, after the app.**

Related docs:
- Packaging design: `docs/superpowers/specs/2026-08-10-capacitor-play-packaging-design.md`
- Packaging plan: `docs/superpowers/plans/2026-08-10-capacitor-play-packaging.md`
- Store copy: `store/listing.md`
- Privacy page (in-app / interim): `privacy.html`

---

## Done in product

- [x] Soft-fill leaf app icons (light/dark, epoxy on Play tiles)
- [x] Cold-start boot overlay (pulse, session-gated)
- [x] Local-only privacy copy (no analytics, ads, crash SDKs, cloud sync)
- [x] Wellness disclaimer (not medical claims) in intro + Patterns
- [x] In-app links to privacy policy
- [x] Play listing draft + Data safety “no data collected/shared” answers in `store/listing.md`
- [x] Public-facing git branch naming (`mindfulfast`)
- [x] Sleep / wake tracker (usual bed + wake, log night, recent list)
- [x] Pitch problem reframed: stress, sleep, food-as-coping (not only willpower)

---

## A. Finish the app (this repo)

### Product / QA

- [ ] Walk every screen on phone: Timer, Cortisol, Urge, Patterns
- [ ] Cold start shows boot once; warm reopen / same session does not
- [ ] Reduced-motion: boot pulse off, app still usable
- [ ] Intro appears once; dismiss sticks
- [ ] Fast start/end, protocol change, wake time, alarms (on-device)
- [ ] Urge flow end-to-end; log appears in Patterns
- [ ] Weight log + chart
- [ ] Dark and light system themes
- [ ] Offline: open with network off after first load (browser/PWA path)
- [ ] No leftover “full free app on the public web” positioning once paid Play is live

### Privacy / policy (in this repo until site ships)

- [ ] Privacy policy text still matches shipped behaviour
- [ ] Wellness disclaimer present anywhere store/policy require it
- [ ] Optional push server stays **off by default** (keeps Data safety = no collection)

### Open product decisions

- [ ] One-time Play price (USD)
- [ ] Lite public demo later? (default for v1: **no**)

---

## B. Capacitor Play packaging (this repo)

Per packaging design: **paid one-time app**, package id `com.nebulaelabs.mindfulfast`, assets **bundled** (not a free public TWA).

- [ ] Review and approve Capacitor packaging design + plan
- [ ] Scaffold Capacitor Android (`appId`: `com.nebulaelabs.mindfulfast`)
- [ ] Sync web assets into Capacitor `www/` (allowlisted copy)
- [ ] Skip service worker registration inside Capacitor; confirm alarms/notifications still acceptable
- [ ] Generate upload keystore (secrets **not** committed); document in `store/signing-README.md`
- [ ] Build signed release `.aab`
- [ ] Internal testing install works offline for core flows
- [ ] TWA / Bubblewrap path treated as retired for paid v1 (keep files only if useful)

---

## C. Google Play Console

- [ ] Create app: `com.nebulaelabs.mindfulfast` (Nebulae Labs developer account)
- [ ] Pricing: paid, one-time (set price from decision above)
- [ ] Upload `.aab` to **Internal testing**
- [ ] Store listing from `store/listing.md` (name, short/full description, screenshots, feature graphic)
- [ ] Support email: `hello@nebulaelabs.dev`
- [ ] Privacy policy URL on `nebulaelabs.dev` (HTTPS) — see section E
- [ ] Data safety: **No data collected / No data shared** (answers in `store/listing.md`)
- [ ] Content rating / target audience (18+; declare fasting/weight topics)
- [ ] Ads declaration: no ads
- [ ] Production release when internal testing + listing + policy are green

---

## D. Domain / interim hosting (app repo only)

App may keep pointing at `nebulaelabs.dev` for policy until the private site repo exists.

- [ ] DNS for `nebulaelabs.dev` at registrar
- [ ] Decide interim host for privacy URL only (GitHub Pages / Stellar / other) until marketing site ships
- [ ] HTTPS working for privacy URL used in Play Console
- [ ] Do **not** position a public full free copy of the paid product as the official product once Play is live

---

## E. Later — Nebulae Labs website (own private repo)

Do this **after** the app is done. Not in this checklist’s critical path except the privacy URL Play needs.

New private repo (suggested), separate from MindFulFast:

- [ ] Create private repo (e.g. `nebulaelabs-site` or `nebulaelabs.dev`)
- [ ] Host on Stellar (per packaging design)
- [ ] Landing page: what MindfulFast is, screenshots, link to Play (not a free full app)
- [ ] Privacy policy page (canonical Play URL), e.g. `https://nebulaelabs.dev/mindfulfast/privacy` or `/privacy`
- [ ] Optional support / contact (`hello@nebulaelabs.dev`)
- [ ] Point Play Console privacy URL at the live site page
- [ ] Soften or remove any old “open the full free app here” links on public hosts

Out of scope for that site v1: runnable full product, accounts, analytics stack.

---

## F. Ship order (recommended)

1. Finish **A** (app QA + decisions)  
2. Build **B** (Capacitor `.aab`)  
3. Stand up a **minimal privacy HTTPS URL** (interim OK) for Play  
4. Complete **C** (Internal testing → production)  
5. Build **E** (private Nebulae Labs site) and switch policy/landing to it  

---

## Notes

- Personal site `ruthann.dev` stays personal; not for Play/policy URLs.
- `nebulaelabs.com` is unrelated; we use **`nebulaelabs.dev`** only.
- Package id is permanent after Play app creation: `com.nebulaelabs.mindfulfast`.
