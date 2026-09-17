const CACHE='velnar-radar-v10';
const SHELL=['./','./index.html','./article.html','./manifest.webmanifest','./assets/velnar-symbol.svg','./assets/radar-qr.svg','./assets/qrcode.min.js','./assets/qrcodejs.LICENSE.txt','./assets/share-export-fix.js','./news.json'];
const NEWS_URL=new URL('./news.json',self.registration.scope).href;
const SHARE_EXPORT_LOADER="\n;(function(){if(document.querySelector('script[data-velnar-share-export]'))return;var s=document.createElement('script');s.src='./assets/share-export-fix.js';s.async=false;s.setAttribute('data-velnar-share-export','1');document.head.appendChild(s)})();";
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
  if(url.pathname.endsWith('/assets/qrcode.min.js')){
    event.respondWith((async()=>{
      let res=null;
      try{
        const fresh=await fetch(req);
        if(fresh.ok){res=fresh;const copy=fresh.clone();caches.open(CACHE).then(cache=>cache.put(req,copy))}
      }catch{}
      if(!res)res=await caches.match(req);
      if(!res)return new Response('/* QRCode unavailable */',{status:503,headers:{'Content-Type':'application/javascript; charset=utf-8'}});
      const text=await res.text();
      return new Response(text+SHARE_EXPORT_LOADER,{status:res.status,statusText:res.statusText,headers:{'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'no-store'}});
    })());
    return;
  }
  if(req.mode==='navigate'){
    const fallback=url.pathname.endsWith('/article.html')?'./article.html':'./index.html';
    event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy))}return res}).catch(()=>caches.match(req).then(hit=>hit||caches.match(fallback))));
    return;
  }
  event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy))}return res})));
});
