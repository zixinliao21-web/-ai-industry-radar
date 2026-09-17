const CACHE='velnar-radar-v22';
const SHELL=['./','./index.html','./article.html','./manifest.webmanifest','./assets/velnar-symbol.svg','./assets/radar-qr.svg','./assets/qrcode.min.js','./assets/qrcodejs.LICENSE.txt','./assets/share-export-fix.js','./assets/radar-runtime.css','./assets/radar-runtime.js','./assets/research-discussion-bridge.js','./news.json'];
const NEWS_URL=new URL('./news.json',self.registration.scope).href;
const SHARE_EXPORT_LOADER="\n;(function(){if(document.querySelector('script[data-velnar-share-export]'))return;var s=document.createElement('script');s.src='./assets/share-export-fix.js';s.async=false;s.setAttribute('data-velnar-share-export','1');document.head.appendChild(s)})();";
const THEME_META='<meta name="color-scheme" content="light dark"><meta name="theme-color" media="(prefers-color-scheme: light)" content="#f3f4f7"><meta name="theme-color" media="(prefers-color-scheme: dark)" content="#111318">';
const RUNTIME_HEAD='<link rel="stylesheet" href="./assets/radar-runtime.css"><script src="./assets/radar-runtime.js"></script>';
const BRIDGE_SCRIPT='<script src="./assets/research-discussion-bridge.js"></script>';

function decorateHtml(res){
  if(!res)return Promise.resolve(res);
  const type=res.headers.get('content-type')||'';
  if(!type.includes('text/html'))return Promise.resolve(res);
  return res.text().then(text=>{
    text=text.replace('<meta name="theme-color" content="#f3f4f7">',THEME_META);
    if(!text.includes('assets/radar-runtime.css'))text=text.replace('</head>',RUNTIME_HEAD+'</head>');
    if(!text.includes('assets/research-discussion-bridge.js'))text=text.replace('</body>',BRIDGE_SCRIPT+'</body>');
    const headers=new Headers(res.headers);
    headers.set('Content-Type','text/html; charset=utf-8');
    headers.set('Cache-Control','no-store');
    headers.delete('Content-Length');
    return new Response(text,{status:res.status,statusText:res.statusText,headers});
  });
}

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==location.origin)return;

  if(url.pathname.endsWith('/news.json')){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      const cached=await cache.match(NEWS_URL);
      try{
        const fresh=await fetch(new Request(NEWS_URL,{cache:'no-store',credentials:'same-origin'}));
        if(fresh.ok){await cache.put(NEWS_URL,fresh.clone());return fresh}
        if(cached)return cached;
        return fresh;
      }catch{
        if(cached)return cached;
        return new Response(JSON.stringify({updated_at:'',items:[]}),{status:200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
      }
    })());
    return;
  }

  if(url.pathname.endsWith('/assets/qrcode.min.js')){
    event.respondWith((async()=>{
      let res=null;
      try{
        const fresh=await fetch(req);
        if(fresh.ok){res=fresh;caches.open(CACHE).then(cache=>cache.put(req,fresh.clone()))}
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
    event.respondWith((async()=>{
      let res=null;
      try{
        const fresh=await fetch(req,{cache:'no-store'});
        if(fresh.ok){res=fresh;caches.open(CACHE).then(cache=>cache.put(req,fresh.clone()))}
      }catch{}
      if(!res)res=await caches.match(req).then(hit=>hit||caches.match(fallback));
      return decorateHtml(res);
    })());
    return;
  }

  event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
    if(res.ok)caches.open(CACHE).then(cache=>cache.put(req,res.clone()));
    return res;
  })));
});
