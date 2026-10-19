/* Service worker: la app funciona sin conexión.
   - Estructura de la app (HTML, JS, CSS, datos): primero la red, si no hay, la copia guardada.
   - Fotos y librerías de Firebase: primero la copia guardada. */
const VERSION = 'nyc27-v2';
const SHELL = ['./', 'index.html', 'styles.css', 'manifest.webmanifest', 'js/config.js', 'js/core.js', 'js/store.js',
  'js/app.js', 'js/sync.js', 'js/sugerencias.js', 'data/fichas.js', 'icons/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== 'nyc27-img' && k !== 'nyc27-lib').map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Firestore y autenticación: siempre directo (Firestore tiene su propia caché)
  if (/googleapis\.com$/.test(url.hostname) && !url.pathname.includes('/firebasejs/')) return;
  if (url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/')) {
    e.respondWith(cacheFirst('nyc27-lib', req)); return;
  }
  if (url.origin !== location.origin) return;
  if (url.pathname.includes('/img/')) { e.respondWith(cacheFirst('nyc27-img', req)); return; }
  e.respondWith(networkFirst(req));
});
async function cacheFirst(name, req) {
  const c = await caches.open(name);
  const hit = await c.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) c.put(req, res.clone());
  return res;
}
async function networkFirst(req) {
  const c = await caches.open(VERSION);
  try {
    const res = await fetch(req);
    if (res.ok) c.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await c.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === 'navigate') return c.match('index.html');
    throw err;
  }
}

// Al tocar un aviso de cambios se abre la app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    for (const c of cs) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow('./');
  }));
});
