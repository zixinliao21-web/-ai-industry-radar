(function(){
  'use strict';
  const KEY='velnar-radar-theme-v1';

  function readMode(){
    try{const v=localStorage.getItem(KEY);return v==='light'||v==='dark'||v==='system'?v:'system'}catch{return'system'}
  }
  function updateThemeColor(mode){
    let m=document.getElementById('velnar-theme-color-manual');
    if(mode==='system'){if(m)m.remove();return}
    if(!m){m=document.createElement('meta');m.id='velnar-theme-color-manual';m.name='theme-color';document.head.appendChild(m)}
    m.content=mode==='dark'?'#111318':'#f3f4f7';
  }
  function apply(mode){
    if(mode!=='light'&&mode!=='dark')mode='system';
    if(mode==='system')document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme',mode);
    document.documentElement.style.colorScheme=mode==='system'?'':mode;
    updateThemeColor(mode);
    const sel=document.getElementById('velnarThemeSelect');if(sel)sel.value=mode;
  }
  function picker(){
    const select=document.createElement('select');
    select.id='velnarThemeSelect';select.className='velnar-theme-select';select.setAttribute('aria-label','页面外观');
    select.innerHTML='<option value="system">跟随系统</option><option value="light">浅色</option><option value="dark">深色</option>';
    select.value=readMode();
    select.addEventListener('change',()=>{try{localStorage.setItem(KEY,select.value)}catch{}apply(select.value)});
    return select;
  }
  function mountPicker(){
    if(document.getElementById('velnarThemeSelect'))return;
    const bar=document.querySelector('.brandbar');if(!bar)return;
    const select=picker();
    const actions=bar.querySelector('.brand-actions');
    if(actions){const mobile=actions.querySelector('.mobile-open');if(mobile)actions.insertBefore(select,mobile);else actions.appendChild(select);return}
    const mode=bar.querySelector('.mode');
    const wrap=document.createElement('div');wrap.className='velnar-theme-wrap';
    if(mode){mode.replaceWith(wrap);wrap.appendChild(mode)}else bar.appendChild(wrap);
    wrap.appendChild(select);
  }
  function mountCollectionNav(){
    if(document.querySelector('.collection-link')||document.getElementById('velnarCollectionNav'))return;
    const bar=document.querySelector('.brandbar');if(!bar)return;
    if(!document.getElementById('velnar-collection-nav-style')){
      const style=document.createElement('style');style.id='velnar-collection-nav-style';style.textContent=`
        .velnar-collection-nav{display:flex;align-items:center;gap:14px;overflow-x:auto;scrollbar-width:none;margin:-24px 0 28px;padding:0 2px 9px;border-bottom:1px solid var(--line);white-space:nowrap}.velnar-collection-nav::-webkit-scrollbar{display:none}.velnar-collection-link{position:relative;flex:0 0 auto;padding:5px 0;color:var(--muted);font-size:10px;line-height:1;text-decoration:none;outline:none}.velnar-collection-link[aria-current="page"]{color:var(--text);font-weight:700}.velnar-collection-link[aria-current="page"]::after{content:'';position:absolute;left:0;right:0;bottom:-10px;height:1px;background:var(--accent)}.velnar-collection-link:focus-visible{box-shadow:0 0 0 3px rgba(57,110,227,.16);border-radius:4px}@media(hover:hover) and (pointer:fine){.velnar-collection-link:hover{color:var(--text)}}@media(max-width:640px){.velnar-collection-nav{gap:12px;margin:-18px 0 22px;padding-bottom:9px}.velnar-collection-link{font-size:9.5px}}
      `;document.head.appendChild(style)
    }
    const path=location.pathname;
    const nav=document.createElement('nav');nav.id='velnarCollectionNav';nav.className='velnar-collection-nav';nav.setAttribute('aria-label','Research collections');
    const links=[
      {href:'./',label:'AI 产业雷达',active:path.endsWith('/')||path.endsWith('/index.html')||path.endsWith('/article.html')},
      {href:'./consumer-radar.html',label:'AI C 端产业雷达',active:path.endsWith('/consumer-radar.html')||path.endsWith('/consumer-article.html')},
      {href:'./deep-read.html',label:'Weekly Deep Read',active:path.endsWith('/deep-read.html')||path.endsWith('/deep-read-article.html')}
    ];
    nav.innerHTML=links.map(x=>'<a class="velnar-collection-link" href="'+x.href+'"'+(x.active?' aria-current="page"':'')+'>'+x.label+'</a>').join('');
    bar.insertAdjacentElement('afterend',nav);
  }
  function loadCollectionBridge(){
    const p=location.pathname;
    const matches=p.endsWith('/consumer-radar.html')||p.endsWith('/consumer-article.html')||p.endsWith('/deep-read.html')||p.endsWith('/deep-read-article.html');
    if(!matches||document.getElementById('velnar-collection-discussion-script')||document.querySelector('script[src="./assets/collection-discussion-bridge.js"]'))return;
    const s=document.createElement('script');s.id='velnar-collection-discussion-script';s.src='./assets/collection-discussion-bridge.js';s.async=false;document.body.appendChild(s);
  }
  function boot(){mountPicker();mountCollectionNav();loadCollectionBridge();apply(readMode())}
  apply(readMode());
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
  window.addEventListener('storage',e=>{if(e.key===KEY)apply(readMode())});
  window.__velnarAppearance={get:readMode,set:function(mode){try{localStorage.setItem(KEY,mode)}catch{}apply(mode)}};
})();
