# Digital Asset Links

A Trusted Web Activity only runs without a browser address bar if the website
proves it authorises the Android app. That proof is a file served at:

    https://waywardnebulae.github.io/.well-known/assetlinks.json

**Note the host.** Asset links are verified at the domain root, not under
`/MindFulFast/`. On `github.io` the root belongs to your user Pages site, not this
project repo, so the file has to be published from a repository named
`waywardnebulae.github.io`. If you do not have one, create it with a
`.well-known/assetlinks.json` at its root.

If that is inconvenient, use a custom domain for the app instead. Then the
root is yours and the file goes in `MindfulFast/.well-known/assetlinks.json`.

## Generating it

After `bubblewrap init`, run:

    bubblewrap fingerprint generateAssetLinks

That prints the JSON with the SHA-256 fingerprint of your signing key. It
looks like this, with your real fingerprint substituted:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "io.github.waywardnebulae.mindfulfast",
    "sha256_cert_fingerprints": ["AA:BB:CC:..."]
  }
}]
```

## Use the fingerprint Play actually signs with

If you opt into Play App Signing, which is the default, Google re-signs your
app with **their** key. The fingerprint in `assetlinks.json` must then be the
one from the Play Console under *Setup > App integrity > App signing key
certificate*, not your local upload key.

Getting this wrong is the single most common TWA mistake. The symptom is an
app that installs fine but shows a browser address bar at the top, because
verification silently failed. Publish both fingerprints during the switchover
if you are unsure; the file accepts an array.

## Verifying

    https://developers.google.com/digital-asset-links/tools/generator

Or on a connected device:

    adb shell dumpsys package d
