# MindfulFast push scheduler

Optional companion service. It holds your fasting alarm schedule and sends a
Web Push at the exact minute each alarm is due.

## Why this exists

A web page cannot run code on a timer once it is closed. The app already
falls back to firing alarms whenever the browser happens to wake its service
worker, but the browser decides when that is, so an alarm can arrive late.

A push is different: the operating system always wakes the service worker to
deliver one. So the only way to get exact timing on a closed app is to have
something outside the phone send a push at the right moment. That is all this
service does.

Without it the app still works. You just get "late but honest" alarms instead
of punctual ones.

## What it is

About 250 lines of Node with one dependency (`web-push`, for VAPID signing
and payload encryption). State is a single JSON file. No database, no
framework, no build step.

## Setup

```bash
cd server
npm install
npm run keys          # prints a VAPID keypair, run once
```

Put the output in your environment:

```bash
export VAPID_PUBLIC_KEY=...
export VAPID_PRIVATE_KEY=...        # secret, never commit this
export VAPID_SUBJECT=mailto:you@example.com
npm start
```

Then open the app, go to the **Alarms** section on the Timer screen, tap
**Connect a push server for exact timing**, and paste the address.

The app subscribes, sends its schedule, and resends it whenever you start or
end a fast or change an alarm toggle.

## It must be reachable over HTTPS

Browsers only allow push subscriptions from a secure context, and the app
needs to reach this service from wherever your phone is. `localhost` works
for development on the same machine; anything else needs real TLS.

Any Node host works: Fly.io, Railway, Render, a small VPS, or a Raspberry Pi
behind a tunnel. A `Dockerfile` is included.

Persist `/app/data` (or set `DATA_FILE`) or you lose the schedule on restart.
It is not fatal, since the app resends its schedule when you next open it, but
alarms will not fire in the meantime.

## Configuration

| Variable | Default | Meaning |
|---|---|---|
| `PORT` | `8787` | Listen port |
| `VAPID_PUBLIC_KEY` | required | Handed to the client |
| `VAPID_PRIVATE_KEY` | required | Signing key, keep secret |
| `VAPID_SUBJECT` | `mailto:admin@example.com` | Contact for push services |
| `DATA_FILE` | `./data/devices.json` | Where the schedule is stored |
| `TICK_MS` | `20000` | How often due alarms are checked |
| `AUTH_TOKEN` | unset | If set, `/schedule` requires `Authorization: Bearer <token>` |
| `ALLOW_ORIGIN` | `*` | CORS origin. Set this to where the app is hosted. |

`TICK_MS` is your timing resolution. At the default an alarm fires within
20 seconds of its target, which is fine for a 16 hour fast.

## Endpoints

| Method | Path | Body | Purpose |
|---|---|---|---|
| GET | `/health` | | Liveness and device count |
| GET | `/vapid` | | Public key for subscribing |
| POST | `/schedule` | `{ subscription, alarms }` | Replace this device's schedule |
| POST | `/unsubscribe` | `{ endpoint }` | Forget a device |

## Notes on running it exposed

`/schedule` is open by default, which is fine for a service only you know the
address of. If you would rather lock it down, set `AUTH_TOKEN`.

Inputs are validated rather than trusted: push endpoints must be HTTPS and
belong to a known push service, so the endpoint cannot be used to make the
server send traffic to an arbitrary host. Alarm counts, payload sizes, and how
far ahead an alarm may be scheduled are all capped.

Subscriptions that a push service reports as gone (404 or 410) are deleted
automatically, as are devices idle for a month with nothing scheduled.

An alarm more than six hours overdue is dropped rather than delivered, so a
service that was down overnight does not wake you with stale alarms.

## Privacy

The service stores a push endpoint and your alarm times. It never sees your
weight, urge log, fasting history, or anything else. All of that stays in
browser storage on your phone.
