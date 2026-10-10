// KU Flood service worker: เปิดแอปได้แม้ไม่มีอินเทอร์เน็ต
const V = 'ku-flood-v1';
const FILES = ['./', 'index.html', 'manifest.webmanifest',
  'icon-192.png', 'icon-512.png', 'maskable-512.png',
  'apple-touch-icon.png', 'favicon-64.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// เปิดครั้งแรกจากแคช แล้วอัปเดตเบื้องหลัง (ถ้าแก้ไฟล์ ให้เปลี่ยนเลข V ด้านบน)
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const same = new URL(r.url).origin === location.origin;
  if (!same) return; // ฟอนต์ภายนอกฯลฯ ให้เบราว์เซอร์จัดการเอง
  e.respondWith(caches.match(r, {ignoreSearch: true}).then(hit => {
    const net = fetch(r).then(res => {
      if (res && res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
      return res;
    }).catch(() => hit || caches.match('index.html'));
    return hit || net;
  }));
});
