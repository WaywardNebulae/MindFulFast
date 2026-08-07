/* ============================================================
   MindfulFast push scheduler

   Holds each device's alarm schedule and sends a Web Push at the
   moment an alarm is due. This is the only way to get exact delivery
   to a closed app, since the browser will not run your code on a
   timer but it will always wake a service worker for a push.

   No framework and no database. One JSON file, one interval loop,
   and web-push for VAPID signing and payload encryption.

   Endpoints
     GET  /health          liveness
     GET  /vapid           the public key the client subscribes with
     POST /schedule        { subscription, alarms:[{id,at,title,body}] }
     POST /unsubscribe     { endpoint }

   Run `npm run keys` once, put the output in your environment,
   then `npm start`.
   ============================================================ */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import webpush from 'web-push';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8787);
const DATA_FILE = process.env.DATA_FILE || path.join(HERE, 'data', 'devices.json');
const TICK_MS = Number(process.env.TICK_MS || 20000);

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';
const AUTH_TOKEN = process.env.AUTH_TOKEN || '';        // optional shared secret
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || '*';

/* ---------- one-off key generation ---------- */
if (process.argv.includes('--generate-keys')) {
  const keys = webpush.generateVAPIDKeys();
  console.log('\nAdd these to your environment:\n');
  console.log('VAPID_PUBLIC_KEY=' + keys.publicKey);
  console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);
  console.log('VAPID_SUBJECT=mailto:you@example.com\n');
  console.log('The public key is safe to expose. Never commit the private key.\n');
  process.exit(0);
}

if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
  console.error('Missing VAPID keys. Run: npm run keys');
  process.exit(1);
}
webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

/* ---------- storage ----------
   Keyed by push endpoint, which is already unique per device+origin.
   Written atomically so a crash mid-write cannot truncate the file. */
let devices = new Map();

function load() {
  try {
    const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    devices = new Map(Object.entries(raw));
    console.log(`loaded ${devices.size} device(s)`);
  } catch (e) {
    devices = new Map();
  }
}

let saveQueued = false;
function save() {
  if (saveQueued) return;
  saveQueued = true;
  setTimeout(() => {
    saveQueued = false;
    try {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      const tmp = DATA_FILE + '.' + crypto.randomBytes(4).toString('hex') + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(Object.fromEntries(devices)));
      fs.renameSync(tmp, DATA_FILE);
    } catch (e) {
      console.error('save failed:', e.message);
    }
  }, 250);
}

/* ---------- validation ----------
   Everything here arrives from the open internet, so nothing is trusted. */
const MAX_ALARMS = 40;
const MAX_AHEAD_MS = 40 * 24 * 3600 * 1000;      // 40 days
const ALLOWED_HOSTS = [
  'android.googleapis.com', 'fcm.googleapis.com',
  'updates.push.services.mozilla.com', 'push.services.mozilla.com',
  'notify.windows.com', 'wns2-*.notify.windows.com',
  'web.push.apple.com'
];

function endpointAllowed(endpoint) {
  let u;
  try { u = new URL(endpoint); } catch (e) { return false; }
  if (u.protocol !== 'https:') return false;
  return ALLOWED_HOSTS.some(h => {
    if (h.includes('*')) {
      const re = new RegExp('^' + h.replace(/[.]/g, '\\.').replace(/\*/g, '[a-z0-9-]+') + '$');
      return re.test(u.hostname);
    }
    return u.hostname === h || u.hostname.endsWith('.' + h);
  });
}

function cleanSubscription(sub) {
  if (!sub || typeof sub.endpoint !== 'string') return null;
  if (sub.endpoint.length > 800 || !endpointAllowed(sub.endpoint)) return null;
  const p256dh = sub.keys && sub.keys.p256dh, auth = sub.keys && sub.keys.auth;
  if (typeof p256dh !== 'string' || typeof auth !== 'string') return null;
  if (p256dh.length > 200 || auth.length > 100) return null;
  return { endpoint: sub.endpoint, keys: { p256dh, auth } };
}

function cleanAlarms(list) {
  if (!Array.isArray(list)) return [];
  const now = Date.now();
  const out = [];
  for (const a of list.slice(0, MAX_ALARMS)) {
    const at = Number(a && a.at);
    if (!Number.isFinite(at) || at <= now || at > now + MAX_AHEAD_MS) continue;
    out.push({
      id: String(a.id || 'alarm').slice(0, 40),
      at,
      title: String(a.title || 'MindfulFast').slice(0, 80),
      body: String(a.body || '').slice(0, 200)
    });
  }
  return out.sort((x, y) => x.at - y.at);
}

/* ---------- delivery ---------- */
async function deliver(device, alarm) {
  const payload = JSON.stringify({
    id: alarm.id, title: alarm.title, body: alarm.body, at: alarm.at
  });
  try {
    await webpush.sendNotification(device.subscription, payload, {
      TTL: 3600,
      urgency: 'high'
    });
    return true;
  } catch (err) {
    // 404/410 mean the browser threw the subscription away for good.
    if (err.statusCode === 404 || err.statusCode === 410) {
      devices.delete(device.subscription.endpoint);
      save();
      console.log('dropped expired subscription');
    } else {
      console.error('push failed:', err.statusCode || err.message);
    }
    return false;
  }
}

/* The scheduler. Fires anything due, keeps a short grace window so a brief
   outage still delivers late rather than silently dropping the alarm. */
const GRACE_MS = 6 * 3600 * 1000;
let ticking = false;

async function tick() {
  if (ticking) return;
  ticking = true;
  try {
    const now = Date.now();
    for (const [endpoint, device] of [...devices]) {
      const due = device.alarms.filter(a => a.at <= now);
      if (!due.length) continue;
      device.alarms = device.alarms.filter(a => a.at > now);
      for (const alarm of due) {
        if (now - alarm.at > GRACE_MS) continue;      // too stale to be useful
        await deliver(device, alarm);
      }
      if (devices.has(endpoint)) devices.set(endpoint, device);
      save();
    }
    // forget devices with nothing scheduled and no contact for a month
    for (const [endpoint, d] of [...devices]) {
      if (!d.alarms.length && now - (d.updated || 0) > 30 * 24 * 3600 * 1000) {
        devices.delete(endpoint);
        save();
      }
    }
  } catch (e) {
    console.error('tick error:', e.message);
  } finally {
    ticking = false;
  }
}

/* ---------- http ---------- */
function send(res, code, body) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(code, {
    'content-type': typeof body === 'string' ? 'text/plain' : 'application/json',
    'access-control-allow-origin': ALLOW_ORIGIN,
    'access-control-allow-headers': 'content-type, authorization',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'cache-control': 'no-store'
  });
  res.end(payload);
}

function readJson(req, limit = 16 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > limit) { reject(new Error('too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
      catch (e) { reject(new Error('bad json')); }
    });
    req.on('error', reject);
  });
}

function authed(req) {
  if (!AUTH_TOKEN) return true;
  const h = req.headers.authorization || '';
  const given = h.startsWith('Bearer ') ? h.slice(7) : '';
  const a = Buffer.from(given), b = Buffer.from(AUTH_TOKEN);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');

  if (req.method === 'OPTIONS') return send(res, 204, '');
  if (url.pathname === '/health') return send(res, 200, { ok: true, devices: devices.size });
  if (url.pathname === '/vapid') return send(res, 200, { publicKey: VAPID_PUBLIC });

  /* Lets an external cron drive the scheduler on hosts that idle the
     process out. Only useful where storage survives the restart. */
  if (url.pathname === '/tick') {
    if (!authed(req)) return send(res, 401, { error: 'unauthorized' });
    const pending = [...devices.values()].reduce((n, d) => n + d.alarms.length, 0);
    await tick();
    return send(res, 200, { ok: true, pending });
  }

  if (url.pathname === '/schedule' && req.method === 'POST') {
    if (!authed(req)) return send(res, 401, { error: 'unauthorized' });
    let body;
    try { body = await readJson(req); }
    catch (e) { return send(res, 400, { error: e.message }); }

    const subscription = cleanSubscription(body.subscription);
    if (!subscription) return send(res, 400, { error: 'invalid subscription' });

    const alarms = cleanAlarms(body.alarms);
    devices.set(subscription.endpoint, { subscription, alarms, updated: Date.now() });
    save();
    return send(res, 200, { ok: true, scheduled: alarms.length, next: alarms[0]?.at || null });
  }

  if (url.pathname === '/unsubscribe' && req.method === 'POST') {
    if (!authed(req)) return send(res, 401, { error: 'unauthorized' });
    let body;
    try { body = await readJson(req); }
    catch (e) { return send(res, 400, { error: e.message }); }
    if (typeof body.endpoint === 'string' && devices.delete(body.endpoint)) save();
    return send(res, 200, { ok: true });
  }

  send(res, 404, { error: 'not found' });
});

load();
setInterval(tick, TICK_MS);
server.listen(PORT, () => {
  console.log(`mindfulfast push scheduler on :${PORT}`);
  console.log(`tick ${TICK_MS}ms   store ${DATA_FILE}`);
  if (!AUTH_TOKEN) console.log('note: AUTH_TOKEN unset, /schedule is open');
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => { server.close(); process.exit(0); });
}
