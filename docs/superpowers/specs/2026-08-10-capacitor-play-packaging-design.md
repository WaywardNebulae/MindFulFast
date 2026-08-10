# MindfulFast — Capacitor Play Packaging Design

**Date:** 2026-08-10  
**Status:** Draft for review  
**Developer:** Nebulae Labs  
**Monetization:** One-time paid Play download (no subscription)

## Goal

Ship MindfulFast as a **paid, one-time purchase** Android app on Google Play, using the existing vanilla HTML/CSS/JS codebase, without giving the full product away for free on the public web.

## Non-goals (v1)

- Subscriptions or Play Billing in-app products
- Rewriting the app in Kotlin/Flutter/React Native
- Trusted Web Activity / Bubblewrap as the paid distribution path
- Paid VPS solely to host the runnable full app
- Mixing the commercial product into `ruthann.dev` (personal site)

## Why not TWA / public GitHub Pages for the product

A TWA loads a live public URL. If that URL is the full app, buyers can skip Play and use the site. That conflicts with **pay once → own forever**.

Therefore the Play binary must **bundle** the app assets. The public website is marketing and policy only.

## Architecture

```
Existing web app (index.html, sw.js, fonts, icons, …)
        │
        ▼
Capacitor Android project
  applicationId: com.nebulaelabs.mindfulfast
        │
        ▼
Signed Android App Bundle (.aab)
        │
        ▼
Google Play (Paid, one-time) — Nebulae Labs developer account
```

- Runtime: Capacitor WebView loads **local bundled assets** (not remote GitHub Pages).
- Offline: preserves the app’s existing local-storage / service-worker intent as far as Capacitor allows; validate SW behavior in WebView during implementation.
- Package ID is permanent after Play app creation: `com.nebulaelabs.mindfulfast`.

## Public web (commercial)

- Personal site `ruthann.dev` stays personal; not used for store/policy URLs.
- Nebulae Labs commercial presence: **`https://nebulaelabs.dev`**, hosted on **Stellar Hosting**.
- v1 public pages only:
  - Landing (what it is, screenshots, link to Play)
  - Privacy policy (required by Play) — e.g. `https://nebulaelabs.dev/mindfulfast/privacy` (exact path set during implementation)
  - Optional support / contact
- Do **not** publish the full runnable app on this domain for free.
- Note: `nebulaelabs.com` is an unrelated third-party site; we do not use it.

## Contact email

- Public / Play support contact: **`hello@nebulaelabs.dev`** (already created)
- Optional later: `support@nebulaelabs.dev` only if you want a separate support inbox
- Play Console **login** stays the approved Google account; domain email is for users and listing “support email,” not a second developer registration

## Retired / de-emphasized path

- `store/twa-manifest.json` and Bubblewrap/TWA asset-links flow are **not** the paid v1 path.
- Keep store listing copy/screenshots under `store/` where useful for Play Console.
- GitHub Pages may remain for development history; it must not be positioned as the free full product once the paid app is live.

## Play Console

- Account: Nebulae Labs (approved developer account already in use).
- Create application with package `com.nebulaelabs.mindfulfast`.
- Pricing: **Paid** app, one-time.
- First upload: Internal testing track, then production when listing/policy complete.
- Signing: Play App Signing (default) + local upload keystore generated for Capacitator/Android builds.
- Store assets: reuse/adapt `store/listing.md`, screenshots, feature graphic already in repo.

## Implementation outline (for the later plan)

1. Scaffold Capacitor around the existing web root; set `appId` to `com.nebulaelabs.mindfulfast`.
2. Generate upload keystore; document alias/password storage (secrets not committed).
3. Build release `.aab`.
4. Create paid app in Play Console; upload to internal testing.
5. Deploy privacy + landing on Stellar / Nebulae Labs domain.
6. Complete Play listing (privacy URL, content rating, target audience, etc.).
7. Soften or remove public “full free app” messaging on any old hosts.

## Success criteria

- Install from Play (after purchase) runs the full app without depending on a public free copy of the product.
- Package ID is `com.nebulaelabs.mindfulfast`.
- Privacy policy URL on the Nebulae Labs domain loads over HTTPS.
- One-time paid pricing configured; no subscription product required for v1.
- No requirement for DigitalOcean or other always-on app host for the binary to work.

## Open questions

1. Preferred Play price (USD) for the one-time charge.
2. Whether a lite public demo is desired later (default: **no** for v1).

## Spec self-review

- Domain confirmed: `nebulaelabs.dev` (not `.com`).
- No intentional placeholders left except Open questions #1–2 (price / lite demo).
- No TWA/Capacitor contradiction: paid path is Capacitor only.
- Scope limited to packaging + commercial web footing for Play; not a redesign of fasting features.
