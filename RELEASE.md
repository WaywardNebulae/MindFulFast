# Shipping MindfulFast to Google Play

The app is a PWA. Getting it into Play means wrapping it in a Trusted Web
Activity: a thin Android app that opens your hosted site full screen with no
browser chrome. The web app stays the product; the wrapper is a shell.

Everything that can be prepared without your accounts and signing keys is
already in the repo. What is left needs you.

---

## Read this part first

This is a weight-loss app that also contains eating-disorder tooling and a
23-hour fasting option. That combination gets looked at. Two policies apply:

- **Health content.** Play restricts apps promoting unhealthy or dangerous
  weight-loss practices, and requires a privacy policy for anything in the
  Health category.
- **Sensitive content.** Loss-of-control eating, lapses, and restriction are
  exactly the topics reviewers are trained to check are handled responsibly.

Being framed as CBT-E-informed self-help is the right side of that line, but
it is not automatic. What is already in place to support it:

- A first-run notice stating the app is not medical advice, that cortisol
  figures are a population estimate rather than a measurement, who should
  speak to a doctor first, and where to get real help.
- Regular eating that deliberately overrides the fasting window, plus a
  pattern-review flag telling you to shorten the fast when urges cluster
  after long gaps. An app that quietly let the fast win would be a much
  harder sell.
- Signposting to CBT-E clinicians in the log itself.
- 18+ positioning in the intro, the listing, and the content rating.

Do not remove those to make the app feel friendlier. They are load-bearing
for approval, and they are also just true.

**If OMAD gets flagged.** The 23:1 protocol is the most likely single point of
objection. If review pushes back, the cheapest fix is to drop the 23:1 option
and keep 16:8 / 18:6 / 20:4. That is a one-line change to `PROTOCOLS` in
`index.html` plus the matching button.

---

## Step 1: Publish the web app

The TWA points at a URL, so the site has to exist first.

### This repository is private, and that blocks Pages

The first deploy attempt failed here:

```
Get Pages site failed. Error: Not Found
Create Pages site failed. Error: Resource not accessible by integration
```

The workflow's own validation passed. What failed was creating the Pages
site. `GITHUB_TOKEN` cannot create one, and Pages on a **private** repository
needs a paid plan (Pro for a personal account). On Free with a private repo it
is not available at all.

**This is not just a hosting inconvenience.** A Trusted Web Activity loads
your URL in a Chrome-backed webview on someone else's phone. If the site sits
behind GitHub authentication, the app does not work for anyone but you. A
shipped Play app needs a publicly reachable URL no matter which host you pick.

Pick one:

- **Make the repository public.** Free, and Pages then works immediately.
  Note this repo also holds `CritterPop`, so it publishes that too.
- **Move MindfulFast to its own public repository.** Keeps everything else
  private. The workflow moves across with a path change.
- **Upgrade to GitHub Pro.** Pages from a private repo, but see the warning
  above: the published site still has to be publicly readable for the TWA.
- **Host it somewhere else.** Netlify, Cloudflare Pages, or any static host.
  The app is plain files with no build step, so this is a drag and drop. Only
  `twa-manifest.json` and the URLs below need updating.

### Once hosting is sorted

1. Repository **Settings > Pages > Source** = **GitHub Actions**. The workflow
   passes `enablement: true`, which turns Pages on by itself where the account
   allows it, but setting it manually is reliable and takes a moment.
2. Push to `main`, or re-run the workflow from the Actions tab.
3. Confirm it is live, **in a private window** so you are not seeing it as an
   authenticated user:
   - `https://waywardnebulae.github.io/MindFulFast/`
   - `https://waywardnebulae.github.io/MindFulFast/privacy.html`

Then install it on your phone from Chrome via **Add to home screen**. If it
does not work as an installed PWA, the TWA will not fix it. This is also the
first point at which background alarms become testable.

## Step 2: Digital Asset Links

Without this the app installs but shows a browser address bar, which reads as
broken. Full instructions and the common failure mode are in
`store/assetlinks-README.md`.

The catch on `github.io`: asset links are verified at the **domain root**,
which belongs to your user Pages site rather than this project repo. You need
a `waywardnebulae.github.io` repository serving
`/.well-known/assetlinks.json`, or a custom domain.

## Step 3: Build the AAB

Needs a JDK, the Android SDK, and Bubblewrap. It cannot be built in this
environment, so run it locally:

```bash
npm install -g @bubblewrap/cli
mkdir twa && cd twa
cp ../MindfulFast/store/twa-manifest.json .
bubblewrap init --manifest https://waywardnebulae.github.io/MindFulFast/manifest.json
bubblewrap build
```

`bubblewrap init` offers to download the JDK and Android SDK for you. It also
generates a signing keystore. **Back that keystore and its passwords up
somewhere you will still have them in two years.** Losing it means you cannot
ship an update to the same listing, ever.

Output is `app-release-bundle.aab`.

To test on a device before uploading:

```bash
bubblewrap install
```

## Step 4: Play Console

1. Create a developer account. One-time 25 USD.
2. **Create app.** Name from `store/listing.md`, type App, free.
3. **Store listing:** short and full description from `store/listing.md`,
   `store/feature-graphic.png`, and the four `store/screen-*.png` files.
4. **App icon:** `icons/icon-512.png`.
5. **Privacy policy:** `https://waywardnebulae.github.io/MindFulFast/privacy.html`
6. **Data safety:** answer **No** to data collection. The reasoning and the
   one exception are written out in `store/listing.md`.
7. **Content rating:** complete the IARC questionnaire. Declare the dieting
   and weight-loss content. Expected answers are in `store/listing.md`.
8. **Health apps declaration:** Play may ask you to confirm the app is not a
   medical device and does not make diagnostic claims. It is not, and it does
   not.
9. Upload the AAB to **Internal testing** first. Not production.
10. Once installed from internal testing, check the address bar is gone. If it
    is there, asset links failed. Go back to step 2 and check you used the
    Play App Signing fingerprint rather than your upload key.
11. Promote to production when you are satisfied.

Review usually takes a few days. A health app with weight-loss content can
take longer, and a first submission from a new account often does.

---

## Updating later

The web app updates on its own. Push to `main`, Pages redeploys, and the
service worker picks up the new version on next launch. **Most changes need no
new AAB and no review.**

You only need a new AAB when something in the Android shell changes: the app
name, icon, package id, permissions, or target SDK. When you do, bump both
`appVersionCode` and `appVersionName` in `store/twa-manifest.json`, rebuild,
and upload.

Play enforces a minimum target SDK level that rises every year. Expect to
rebuild roughly annually to stay compliant even if the app itself is unchanged.

---

## Optional: the push server

Not required for launch, and the app works without it. Alarms fall back to
firing on the browser's next wake-up and saying how late they were.

If you want exact delivery to a closed app, `server/` holds the scheduler and
`server/README.md` covers deployment. It needs an always-on process with
storage that survives a restart. Free tiers that sleep will not work: a cold
start loses the schedule, and a closed app cannot resend it.

If you do enable it by default for users, revisit the Data safety answers.
Shipping it off by default is what keeps that form a clean "no data
collected".

---

## iOS

Apple does not accept PWA wrappers of this kind. App Store Review Guideline
4.2 rejects apps that are primarily a website in a shell, and 1.4.1 covers
health and weight-loss claims separately.

An iOS version means a real native or Capacitor build, and the fasting-plus-
eating-disorder content would need the same care there. Treat it as a separate
project rather than an export target.
