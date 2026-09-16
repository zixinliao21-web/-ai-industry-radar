const CACHE='velnar-radar-v3';
const SHELL=['./','./index.html','./article.html','./manifest.webmanifest','./assets/velnar-symbol.svg','./assets/radar-qr.svg','./news.json'];
const NEWS_URL=new URL('./news.json',self.registration.scope).href;
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==location.origin)return;
  if(url.pathname.endsWith('/news.json')){
    event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(NEWS_URL,copy))}return res}).catch(()=>caches.match(NEWS_URL)));
    return;
  }
  if(req.mode==='navigate'){
    const fallback=url.pathname.endsWith('/article.html')?'./article.html':'./index.html';
    event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy))}return res}).catch(()=>caches.match(req).then(hit=>hit||caches.match(fallback))));
    return;
  }
  event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy))}return res})));
});
