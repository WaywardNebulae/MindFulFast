/* ============================================================
   MindfulFast service worker

   Alarm delivery, best mechanism first:

   1. TimestampTrigger  = exact, works with the app closed, no server.
                          Feature-detected: the Notification Triggers API
                          never shipped past its Chrome origin trial, so
                          this is usually absent.
   2. SW wake-ups       = periodicsync / sync / push / message / fetch all
                          wake this worker. On every wake we fire anything
                          already due. Delivery is late, not missed.
   3. App open          = the page pings us on load and on becoming
                          visible, which flushes anything still pending.

   The schedule lives in IndexedDB because it must outlive the page.
   ============================================================ */

const CACHE_NAME = 'mindfulfast-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './fonts.css',
  './fonts/figtree-400.woff2',
  './fonts/figtree-500.woff2',
  './fonts/figtree-600.woff2',
  './fonts/literata-400.woff2',
  './fonts/literata-500.woff2'
];

const DB_NAME = 'mindfulfast-alarms';
const STORE = 'alarms';
const SYNC_TAG = 'mindfulfast-alarms';

/* ---------------- IndexedDB ---------------- */
function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function allAlarms() {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (e) { return []; }
}

async function dropAlarm(id) {
  try {
    const db = await openDb();
    await new Promise(resolve => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = tx.onerror = () => resolve();
    });
  } catch (e) {}
}

/* ---------------- delivery ---------------- */
const TRIGGERS_SUPPORTED =
  typeof Notification !== 'undefined' && 'showTrigger' in Notification.prototype;

function lateness(ms) {
  const m = Math.round(ms / 60000);
  if (m < 60) return m + (m === 1 ? ' minute' : ' minutes') + ' ago';
  const h = Math.round(m / 60);
  return h + (h === 1 ? ' hour' : ' hours') + ' ago';
}

async function show(alarm, lateBy) {
  const opts = {
    body: lateBy > 120000 ? alarm.body + '\nDue ' + lateness(lateBy) + '.' : alarm.body,
    tag: alarm.id,
    renotify: true,
    requireInteraction: true,
    timestamp: alarm.at,
    vibrate: [220, 120, 220],
    data: { at: alarm.at }
  };
  try {
    await self.registration.showNotification(alarm.title, opts);
  } catch (e) {
    delete opts.vibrate;                       // some UAs reject vibrate
    try { await self.registration.showNotification(alarm.title, opts); } catch (e2) {}
  }
}

/* Fire everything due, then re-arm exact triggers for what is still ahead. */
async function fireDue() {
  const now = Date.now();
  const alarms = await allAlarms();

  for (const a of alarms) {
    if (a.at > now) continue;
    // A TimestampTrigger may already have delivered this one.
    let already = [];
    try { already = await self.registration.getNotifications({ tag: a.id }); } catch (e) {}
    if (!already.length) await show(a, now - a.at);
    await dropAlarm(a.id);
  }
  await armTriggers();
}

/* Exact scheduling where the platform supports it. */
async function armTriggers() {
  if (!TRIGGERS_SUPPORTED) return;
  const now = Date.now();
  for (const a of await allAlarms()) {
    if (a.at <= now) continue;
    let pending = [];
    try {
      pending = await self.registration.getNotifications({ tag: a.id, includeTriggered: true });
    } catch (e) {}
    if (pending.length) continue;
    try {
      await self.registration.showNotification(a.title, {
        body: a.body,
        tag: a.id,
        requireInteraction: true,
        timestamp: a.at,
        data: { at: a.at },
        showTrigger: new TimestampTrigger(a.at)
      });
    } catch (e) {}
  }
}

/* ---------------- lifecycle ---------------- */
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
    await fireDue();
  })());
});

/* ---------------- wake-ups ---------------- */
self.addEventListener('periodicsync', event => {
  if (event.tag === SYNC_TAG) event.waitUntil(fireDue());
});

self.addEventListener('sync', event => {
  if (event.tag === SYNC_TAG) event.waitUntil(fireDue());
});

/* A push from the scheduler carries the alarm it is firing. Show that
   directly, then flush anything else due while we are awake.
   userVisibleOnly means we must always show something, so a payload we
   cannot parse still produces a notification via fireDue(). */
self.addEventListener('push', event => {
  event.waitUntil((async () => {
    let alarm = null;
    try { alarm = event.data ? event.data.json() : null; } catch (e) {}

    if (alarm && alarm.title) {
      const already = await self.registration.getNotifications({ tag: alarm.id || alarm.title })
        .catch(() => []);
      if (!already.length) {
        await show({
          id: alarm.id || alarm.title,
          at: alarm.at || Date.now(),
          title: alarm.title,
          body: alarm.body || ''
        }, Date.now() - (alarm.at || Date.now()));
      }
      if (alarm.id) await dropAlarm(alarm.id);
    }
    await fireDue();
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'alarms-changed') {
    event.waitUntil(fireDue());
  }
});

let lastOpportunisticCheck = 0;
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
  // Cheap piggyback: any navigation is also a chance to flush due alarms.
  const now = Date.now();
  if (now - lastOpportunisticCheck > 60000) {
    lastOpportunisticCheck = now;
    event.waitUntil(fireDue());
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of clients) {
      if ('focus' in c) return c.focus();
    }
    return self.clients.openWindow('./');
  })());
});
