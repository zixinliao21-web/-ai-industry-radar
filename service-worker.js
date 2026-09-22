const CACHE='velnar-radar-v40';
const SHELL=[
  './','./index.html','./article.html',
  './consumer-radar.html','./consumer-article.html',
  './deep-read.html','./deep-read-article.html',
  './manifest.webmanifest',
  './assets/velnar-symbol.svg','./assets/radar-qr.svg',
  './assets/qrcode.min.js','./assets/qrcodejs.LICENSE.txt',
  './assets/share-export-fix.js','./assets/radar-runtime.css','./assets/radar-runtime.js','./assets/state-sync.js','./assets/article-reader.js','./assets/research-discussion-bridge.js','./assets/collection-discussion-bridge.js',
  './news-index.json','./consumer-radar.json','./deep-read.json'
];
const DATA_FILES=['news-index.json','consumer-radar.json','deep-read.json'];
const NETWORK_FIRST_ASSETS=['/assets/radar-runtime.js','/assets/state-sync.js','/assets/article-reader.js','/assets/research-discussion-bridge.js','/assets/collection-discussion-bridge.js'];
const SHARE_EXPORT_LOADER="\n;(function(){if(document.querySelector('script[data-velnar-share-export]'))return;var s=document.createElement('script');s.src='./assets/share-export-fix.js';s.async=false;s.setAttribute('data-velnar-share-export','1');document.head.appendChild(s)})();";
const THEME_META='<meta name="color-scheme" content="light dark"><meta name="theme-color" media="(prefers-color-scheme: light)" content="#f3f4f7"><meta name="theme-color" media="(prefers-color-scheme: dark)" content="#111318">';
const RUNTIME_CSS='<link rel="stylesheet" href="./assets/radar-runtime.css">';
const LATE_LOADER=`<script id="velnar-enhancement-loader">(function(){
function add(src,id){if(document.getElementById(id)||document.querySelector('script[src="'+src+'"]'))return;var s=document.createElement('script');s.id=id;s.src=src;s.async=false;document.body.appendChild(s)}
function waitForArticle(src,id){var tries=0,t=setInterval(function(){tries++;if(document.querySelector('#articleRoot .article')){clearInterval(t);add(src,id)}else if(tries>=100){clearInterval(t)}},120)}
function boot(){
  add('./assets/radar-runtime.js','velnar-runtime-script');
  add('./assets/state-sync.js','velnar-state-sync-script');
  var p=location.pathname;
  var isIndustryIndex=p.endsWith('/')||p.endsWith('/index.html');
  if(isIndustryIndex){add('./assets/research-discussion-bridge.js','velnar-discussion-script');return}
  if(p.endsWith('/article.html')){waitForArticle('./assets/research-discussion-bridge.js','velnar-discussion-script');return}
  if(p.endsWith('/consumer-radar.html')||p.endsWith('/deep-read.html')){add('./assets/collection-discussion-bridge.js','velnar-collection-discussion-script');return}
  if(p.endsWith('/consumer-article.html')||p.endsWith('/deep-read-article.html')){waitForArticle('./assets/collection-discussion-bridge.js','velnar-collection-discussion-script')}
}
if(document.readyState==='complete')setTimeout(boot,0);else window.addEventListener('load',function(){setTimeout(boot,0)},{once:true});
})();</script>`;

function decorateHtml(res){
  if(!res)return Promise.resolve(res);
  const type=res.headers.get('content-type')||'';
  if(!type.includes('text/html'))return Promise.resolve(res);
  return res.text().then(text=>{
    text=text.replace('<meta name="theme-color" content="#f3f4f7">',THEME_META);
    if(!text.includes('assets/radar-runtime.css'))text=text.replace('</head>',RUNTIME_CSS+'</head>');
    if(!text.includes('id="velnar-enhancement-loader"'))text=text.replace('</body>',LATE_LOADER+'</body>');
    const headers=new Headers(res.headers);
    headers.set('Content-Type','text/html; charset=utf-8');
    headers.set('Cache-Control','no-store');
    headers.delete('Content-Length');
    return new Response(text,{status:res.status,statusText:res.statusText,headers});
  });
}

function dataFileFor(pathname){return DATA_FILES.find(name=>pathname.endsWith('/'+name))||null}
function isIndustryItem(pathname){return /\/news-items\/[^/]+\.json$/.test(pathname)}
function industryIndexSegmentFor(pathname){const m=pathname.match(/\/news-index-segments\/(segment-\d+\.json)$/);return m?('news-index-segments/'+m[1]):null}
function fallbackFor(pathname){
  if(pathname.endsWith('/article.html'))return './article.html';
  if(pathname.endsWith('/consumer-article.html'))return './consumer-article.html';
  if(pathname.endsWith('/consumer-radar.html'))return './consumer-radar.html';
  if(pathname.endsWith('/deep-read-article.html'))return './deep-read-article.html';
  if(pathname.endsWith('/deep-read.html'))return './deep-read.html';
  return './index.html';
}
function isNetworkFirstAsset(pathname){return NETWORK_FIRST_ASSETS.some(path=>pathname.endsWith(path))}

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

  const dataFile=dataFileFor(url.pathname);
  if(dataFile){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      const canonical=new URL('./'+dataFile,self.registration.scope).href;
      const cached=await cache.match(canonical);
      try{
        const fresh=await fetch(new Request(canonical,{cache:'no-store',credentials:'same-origin'}));
        if(fresh.ok){await cache.put(canonical,fresh.clone());return fresh}
        if(cached)return cached;
        return fresh;
      }catch{
        if(cached)return cached;
        return new Response(JSON.stringify({updated_at:'',items:[]}),{status:200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
      }
    })());
    return;
  }

  const indexSegment=industryIndexSegmentFor(url.pathname);
  if(indexSegment){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      const canonical=new URL('./'+indexSegment,self.registration.scope).href;
      const cached=await cache.match(canonical);
      try{
        const fresh=await fetch(new Request(canonical,{cache:'no-store',credentials:'same-origin'}));
        if(fresh.ok){await cache.put(canonical,fresh.clone());return fresh}
        if(cached)return cached;
        return fresh;
      }catch{
        if(cached)return cached;
        return new Response(JSON.stringify({schema_version:'3.0',items:[]}),{status:503,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
      }
    })());
    return;
  }

  if(isIndustryItem(url.pathname)){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      try{
        const fresh=await fetch(new Request(req,{cache:'no-store',credentials:'same-origin'}));
        if(fresh.ok){await cache.put(req,fresh.clone());return fresh}
        const cached=await cache.match(req);
        return cached||fresh;
      }catch{
        const cached=await cache.match(req);
        return cached||new Response(JSON.stringify({error:'Industry Radar article unavailable'}),{status:503,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
      }
    })());
    return;
  }

  if(isNetworkFirstAsset(url.pathname)){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      try{
        const fresh=await fetch(new Request(req,{cache:'no-store'}));
        if(fresh.ok){await cache.put(req,fresh.clone());return fresh}
      }catch{}
      const cached=await cache.match(req);
      return cached||new Response('/* VELNAR runtime unavailable */',{status:503,headers:{'Content-Type':'application/javascript; charset=utf-8'}});
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
    const fallback=fallbackFor(url.pathname);
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