const CACHE='velnar-radar-v15';
const SHELL=['./','./index.html','./article.html','./manifest.webmanifest','./assets/velnar-symbol.svg','./assets/radar-qr.svg','./assets/qrcode.min.js','./assets/qrcodejs.LICENSE.txt','./assets/share-export-fix.js','./news.json'];
const NEWS_URL=new URL('./news.json',self.registration.scope).href;
const SHARE_EXPORT_LOADER="\n;(function(){if(document.querySelector('script[data-velnar-share-export]'))return;var s=document.createElement('script');s.src='./assets/share-export-fix.js';s.async=false;s.setAttribute('data-velnar-share-export','1');document.head.appendChild(s)})();";
const INDEX_BRAND_STYLE='<style id="velnar-sticky-brand-v15">.brandbar{top:0!important;margin:0 0 52px!important;padding:10px 0 12px!important;border:0!important;border-bottom:1px solid rgba(17,18,20,.075)!important;border-radius:0!important;background:#f3f4f7!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}@media(max-width:760px){.brandbar{top:0!important;margin:0 0 34px!important;padding:8px 0 10px!important}}</style>';
const ARTICLE_BRAND_STYLE='<style id="velnar-sticky-brand-v15">.brandbar{top:0!important;margin:0 0 26px!important;padding:8px 0 9px!important;border:0!important;border-bottom:1px solid rgba(17,18,20,.075)!important;border-radius:0!important;background:#f3f4f7!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}.mode{color:#a0a2aa!important}@media(max-width:640px){.brandbar{top:0!important;margin:0 0 18px!important;padding:7px 0 8px!important}}</style>';
const DARK_THEME_STYLE=`<style id="velnar-system-theme-v15">
:root{color-scheme:light dark}
@media(prefers-color-scheme:dark){
:root{--bg:#111318;--card:#181a20;--text:#f2f3f5;--muted:#969aa5;--line:#2a2d35;--line-strong:#393d47;--brand:#f2f4ff;--soft:#17191f;--accent:#7f9cff;color-scheme:dark}
html,body{background:var(--bg)!important;color:var(--text)!important}
.brandbar{background:var(--bg)!important;border-bottom-color:rgba(255,255,255,.085)!important}.brandname{color:#f3f5ff!important}.brandtag,.product,.mode,.archive-mark{color:#9297a3!important}
.mobile-open,.control{background:#191c22!important;border-color:#30343d!important;color:#e7e9ee!important}.mobile-open:focus-visible,.control:focus-visible{box-shadow:0 0 0 3px rgba(127,156,255,.18),0 0 0 1px rgba(127,156,255,.65)!important}
.hero p,.hero-note,.section-desc,.section-count,.meta,.theme,.updated,.legend{color:#9599a4!important}.hero-note{border-color:#343842!important}.hero-note b{color:#e6e8ed!important}.eyebrow,.section-title{color:#b0b4be!important}
.stat{background:#17191f!important;border-color:#292c34!important}.stat-label{color:#858a95!important}.stat-value{color:#f2f3f5!important}
.list{background:#17191f!important;border-color:#2a2d35!important;box-shadow:none!important}.item{border-bottom-color:#292c34!important;color:#eceef2!important}.item:hover,.item:focus-visible{background:#1b1e25!important}.item:focus-visible{box-shadow:inset 0 0 0 2px rgba(127,156,255,.55)!important}.read .item{background:#14161b!important;opacity:.62}.read .item:hover{background:#191b21!important}.title{color:#eff1f4!important}.arrow{color:#737985!important}.grade{background:#f0f2f5!important;color:#111318!important}.grade.A{background:#858a95!important;color:#fff!important}.grade.B{background:#555b66!important;color:#fff!important}.legend{border-color:#2a2d35!important}.legend strong{color:#d5d8de!important}.error{background:#181a20!important;border-color:#2c3038!important;color:#c5c8cf!important}
.qr-card{background:#181a20!important;border-color:#30343d!important;box-shadow:0 24px 80px rgba(0,0,0,.45)!important}.qr-title{color:#f2f3f5!important}.qr-sub,.qr-url,.qr-tip{color:#999da7!important}.qr-tip{border-color:#2d3038!important}.qr-close,.qr-action{background:#20232a!important;border-color:#343842!important;color:#e8eaf0!important}.qr-code{background:#fff!important;color-scheme:light}
.article{background:#181a20!important;border-color:#2b2e36!important;box-shadow:none!important}.article h1{color:#f3f4f6!important}.themes,.reading-meta{color:#9297a3!important}.deck{color:#c6c9d0!important}.section h2{color:#a5a9b3!important}.section h2::before{background:#555a65!important}.body{color:#d9dce2!important}.question{background:#202229!important;border-color:#2d3038!important}.sources a{border-color:#2a2d35!important;color:#dfe1e6!important}.source-index{color:#7f8490!important}
.toc{background:#17191f!important;border-color:#2d3038!important;backdrop-filter:none!important}.toc-link{color:#858a95!important}.toc-link.active{color:#edf0f5!important}
.archive-link{background:#17191f!important;border-color:#2b2e36!important}.archive-label,.archive-meta,.footerbrand{color:#858a95!important}.archive-title{color:#dfe1e6!important}.to-top{background:#1b1e24!important;border-color:#31353e!important;color:#dfe2e7!important;backdrop-filter:none!important}
.share-layer{background:rgba(4,5,8,.68)!important}.share-shell{background:#17191f!important;border-color:#2a2d35!important;box-shadow:0 28px 90px rgba(0,0,0,.5)!important}.share-head-copy{color:#969aa4!important}.share-head-copy strong{color:#edf0f4!important}.share-close{background:#20232a!important;border-color:#353942!important;color:#e5e7ec!important}.share-action{background:#20232a!important;border-color:#343842!important;color:#e7e9ee!important}.share-action.primary{background:#f0f2f5!important;border-color:#f0f2f5!important;color:#111318!important}.share-note{color:#858a95!important}
.share-card{background:#fff!important;color:#111214!important;border-color:#dedfe4!important;border-top-color:#080c43!important;color-scheme:light}.share-card .share-brand-name{color:#080c43!important}.share-card .share-product,.share-card .share-card-meta,.share-card .share-deck,.share-card .share-url,.share-card .share-qr-copy{color:#777983!important}.share-card .share-title{color:#111214!important}.share-card .share-qr{background:#fff!important;border-color:#e2e4e9!important}
::selection{background:rgba(127,156,255,.28)}
}
</style>`;
const THEME_META='<meta name="color-scheme" content="light dark"><meta name="theme-color" media="(prefers-color-scheme: light)" content="#f3f4f7"><meta name="theme-color" media="(prefers-color-scheme: dark)" content="#111318">';
function decorateHtml(res,isArticle){
  if(!res)return Promise.resolve(res);
  const type=res.headers.get('content-type')||'';
  if(!type.includes('text/html'))return Promise.resolve(res);
  return res.text().then(text=>{
    text=text.replace('<meta name="theme-color" content="#f3f4f7">',THEME_META);
    if(!text.includes('velnar-sticky-brand-v15')){
      const style=(isArticle?ARTICLE_BRAND_STYLE:INDEX_BRAND_STYLE)+DARK_THEME_STYLE;
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