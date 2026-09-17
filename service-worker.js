const CACHE='velnar-radar-v13';
const SHELL=['./','./index.html','./article.html','./manifest.webmanifest','./assets/velnar-symbol.svg','./assets/radar-qr.svg','./assets/qrcode.min.js','./assets/qrcodejs.LICENSE.txt','./assets/share-export-fix.js','./news.json'];
const NEWS_URL=new URL('./news.json',self.registration.scope).href;
const SHARE_EXPORT_LOADER="\n;(function(){if(document.querySelector('script[data-velnar-share-export]'))return;var s=document.createElement('script');s.src='./assets/share-export-fix.js';s.async=false;s.setAttribute('data-velnar-share-export','1');document.head.appendChild(s)})();";
const INDEX_BRAND_STYLE='<style id="velnar-sticky-brand-v13">.brandbar{top:0!important;margin:0 0 52px!important;padding:10px 0 12px!important;border:0!important;border-bottom:1px solid rgba(17,18,20,.075)!important;border-radius:0!important;background:#f3f4f7!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}@media(max-width:760px){.brandbar{top:0!important;margin:0 0 34px!important;padding:8px 0 10px!important}}</style>';
const ARTICLE_BRAND_STYLE='<style id="velnar-sticky-brand-v13">.brandbar{top:0!important;margin:0 0 26px!important;padding:8px 0 9px!important;border:0!important;border-bottom:1px solid rgba(17,18,20,.075)!important;border-radius:0!important;background:#f3f4f7!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}.mode{color:#a0a2aa!important}@media(max-width:640px){.brandbar{top:0!important;margin:0 0 18px!important;padding:7px 0 8px!important}}</style>';
function decorateHtml(res,isArticle){
  if(!res)return Promise.resolve(res);
  const type=res.headers.get('content-type')||'';
  if(!type.includes('text/html'))return Promise.resolve(res);
  return res.text().then(text=>{
    if(!text.includes('velnar-sticky-brand-v13')){
      const style=isArticle?ARTICLE_BRAND_STYLE:INDEX_BRAND_STYLE;
      text=text.includes('</head>')?text.replace('</head>',style+'</head>'):style+text;
    }
    const headers=new Headers(res.headers);
    headers.set('Content-Type','text/html; charset=utf-8');
    headers.set('Cache-Control','no-store');
    headers.delete('Content-Length');
    return new Response(text,{status:res.status,statusText:res.statusText,headers});
  });
}
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
    const isArticle=url.pathname.endsWith('/article.html');
    const fallback=isArticle?'./article.html':'./index.html';
    event.respondWith((async()=>{
      let res=null;
      try{
        const fresh=await fetch(req);
        if(fresh.ok){res=fresh;const copy=fresh.clone();caches.open(CACHE).then(cache=>cache.put(req,copy))}
      }catch{}
      if(!res)res=await caches.match(req).then(hit=>hit||caches.match(fallback));
      return decorateHtml(res,isArticle);
    })());
    return;
  }
  event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy))}return res})));
});