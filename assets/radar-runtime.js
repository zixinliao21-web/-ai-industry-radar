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
    let actions=bar.querySelector('.brand-actions');
    if(!actions){
      actions=document.createElement('div');
      actions.className='brand-actions velnar-header-actions';
      const mode=bar.querySelector('.mode');
      if(mode)actions.appendChild(mode);
      bar.appendChild(actions);
    }
    actions.appendChild(select);
  }
  function collectionLinks(){
    const path=location.pathname;
    return[
      {href:'./',label:'AI 产业雷达',short:'AI 产业雷达',active:path.endsWith('/')||path.endsWith('/index.html')||path.endsWith('/article.html')},
      {href:'./consumer-radar.html',label:'AI C 端产业雷达',short:'C 端产业雷达',active:path.endsWith('/consumer-radar.html')||path.endsWith('/consumer-article.html')},
      {href:'./deep-read.html',label:'Weekly Deep Read',short:'Deep Read',active:path.endsWith('/deep-read.html')||path.endsWith('/deep-read-article.html')}
    ];
  }
  function mountCollectionNav(){
    if(document.querySelector('.collection-link')||document.getElementById('velnarCollectionNav'))return;
    const bar=document.querySelector('.brandbar');if(!bar)return;
    if(!document.getElementById('velnar-collection-nav-style')){
      const style=document.createElement('style');style.id='velnar-collection-nav-style';style.textContent=`
        .velnar-collection-nav{display:flex;align-items:center;gap:14px;overflow-x:auto;scrollbar-width:none;margin:-24px 0 28px;padding:0 2px 9px;border-bottom:1px solid var(--line);white-space:nowrap}.velnar-collection-nav::-webkit-scrollbar{display:none}.velnar-collection-link{position:relative;flex:0 0 auto;padding:5px 0;color:var(--muted);font-size:10px;line-height:1;text-decoration:none;outline:none}.velnar-collection-link[aria-current="page"]{color:var(--text);font-weight:700}.velnar-collection-link[aria-current="page"]::after{content:'';position:absolute;left:0;right:0;bottom:-10px;height:1px;background:var(--accent)}.velnar-collection-link:focus-visible{box-shadow:0 0 0 3px rgba(57,110,227,.16);border-radius:4px}@media(hover:hover) and (pointer:fine){.velnar-collection-link:hover{color:var(--text)}}@media(max-width:640px){.velnar-collection-nav{display:none}}
      `;document.head.appendChild(style)
    }
    const nav=document.createElement('nav');nav.id='velnarCollectionNav';nav.className='velnar-collection-nav';nav.setAttribute('aria-label','Research collections');
    const links=collectionLinks();
    nav.innerHTML=links.map(x=>'<a class="velnar-collection-link" href="'+x.href+'"'+(x.active?' aria-current="page"':'')+'>'+x.label+'</a>').join('');
    bar.insertAdjacentElement('afterend',nav);
  }
  function mountMobileCollectionPicker(){
    if(document.getElementById('velnarCollectionSelect'))return;
    const bar=document.querySelector('.brandbar'),lock=bar&&bar.querySelector('.brandlock');if(!bar||!lock)return;
    const links=collectionLinks(),current=links.find(x=>x.active)||links[0];
    const select=document.createElement('select');
    select.id='velnarCollectionSelect';select.className='velnar-collection-select';select.setAttribute('aria-label','切换研究板块');
    select.innerHTML=links.map(x=>'<option value="'+x.href+'"'+(x.active?' selected':'')+'>'+x.short+'</option>').join('');
    select.value=current.href;
    select.addEventListener('change',()=>{if(select.value&&select.value!==current.href)location.href=select.value});
    lock.appendChild(select);
  }
  function syncStickyMetrics(){
    const bar=document.querySelector('.brandbar');if(!bar)return;
    const applyHeight=()=>document.documentElement.style.setProperty('--velnar-header-height',Math.ceil(bar.getBoundingClientRect().height)+'px');
    applyHeight();
    if('ResizeObserver'in window){const ro=new ResizeObserver(applyHeight);ro.observe(bar)}
    else window.addEventListener('resize',applyHeight,{passive:true});
  }
  function injectMobileHierarchyStyle(){
    if(document.getElementById('velnar-mobile-hierarchy-style'))return;
    const s=document.createElement('style');s.id='velnar-mobile-hierarchy-style';s.textContent=`
      .velnar-more-button{display:none;width:38px;height:38px;border:1px solid var(--line);border-radius:12px;background:var(--bg);color:var(--text);place-items:center;font:800 17px/1 -apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang SC","Helvetica Neue",Arial,sans-serif;cursor:pointer}
      .velnar-more-menu{position:fixed;right:14px;top:calc(var(--velnar-header-height,64px) + 6px);z-index:1650;display:none;width:218px;padding:7px;border:1px solid var(--line);border-radius:14px;background:var(--card);box-shadow:0 18px 50px rgba(17,18,20,.16);color:var(--text)}
      .velnar-more-menu.open{display:block}.velnar-more-item{display:flex;width:100%;min-height:42px;box-sizing:border-box;align-items:center;justify-content:space-between;gap:12px;padding:9px 10px;border:0;border-radius:10px;background:transparent;color:var(--text);font:650 11px/1.25 -apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang SC","Helvetica Neue",Arial,sans-serif;text-align:left;cursor:pointer}
      .velnar-more-item small{font-size:9px;font-weight:550;color:var(--muted)}.velnar-more-item:hover,.velnar-more-item:focus-visible{background:var(--soft);outline:none}.velnar-more-rule{height:1px;background:var(--line);margin:5px 4px}.velnar-theme-options{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;padding:5px}.velnar-theme-option{min-height:34px;border:1px solid var(--line);border-radius:9px;background:transparent;color:var(--muted);font:650 9px/1 -apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang SC","Helvetica Neue",Arial,sans-serif}.velnar-theme-option.active{background:var(--soft);color:var(--text);border-color:var(--line-strong)}
      @media(max-width:640px){
        .brandbar{padding-top:8px!important;padding-bottom:8px!important}
        .brandbar>.brand-actions{gap:0!important}
        .brandbar .mobile-open,.brandbar .velnar-theme-select,.brandbar .vss-button{display:none!important}
        .velnar-more-button{display:grid}
        .brandlock{gap:7px!important}.brandmark{flex:0 0 auto}.brandname{flex:0 0 auto}
        .shell>.hero{gap:14px!important;margin-bottom:24px!important}
        .shell>.hero .eyebrow{margin-bottom:10px!important}
        .shell>.hero p{margin-top:14px!important;line-height:1.62!important}
        .shell>.hero .hero-note{padding-top:9px!important}
        .shell>.hero .hero-note-copy{display:none!important}
        .shell>.stats{gap:7px!important;margin-bottom:22px!important}
        .shell>.stats .stat{padding:8px 9px!important;border-radius:12px!important}
        .shell>.stats .stat-label{margin-bottom:3px!important;line-height:1.1!important}
        .shell>.stats .stat-value{font-size:18px!important;line-height:1.05!important}
      }
      @media(prefers-reduced-motion:reduce){.velnar-more-menu{transition:none!important}}
    `;document.head.appendChild(s);
  }
  function mountMobileUtilityMenu(){
    if(document.getElementById('velnarMoreButton'))return;
    const bar=document.querySelector('.brandbar'),actions=bar&&bar.querySelector('.brand-actions');if(!bar||!actions)return;
    injectMobileHierarchyStyle();
    const btn=document.createElement('button');btn.type='button';btn.id='velnarMoreButton';btn.className='velnar-more-button';btn.textContent='···';btn.setAttribute('aria-label','更多设置');btn.setAttribute('aria-haspopup','menu');btn.setAttribute('aria-expanded','false');actions.appendChild(btn);
    const menu=document.createElement('div');menu.id='velnarMoreMenu';menu.className='velnar-more-menu';menu.setAttribute('role','menu');
    menu.innerHTML='<button class="velnar-more-item" type="button" data-action="share"><span>分享当前页面</span><small>Share</small></button><div class="velnar-more-rule"></div><div class="velnar-theme-options" aria-label="页面外观"><button class="velnar-theme-option" type="button" data-theme-mode="system">系统</button><button class="velnar-theme-option" type="button" data-theme-mode="light">浅色</button><button class="velnar-theme-option" type="button" data-theme-mode="dark">深色</button></div><div class="velnar-more-rule"></div><button class="velnar-more-item" type="button" data-action="sync"><span>同步设置</span><small>Sync</small></button>';
    document.body.appendChild(menu);
    const themeButtons=[...menu.querySelectorAll('[data-theme-mode]')];
    function updateTheme(){const mode=readMode();themeButtons.forEach(x=>x.classList.toggle('active',x.dataset.themeMode===mode))}
    function close(){menu.classList.remove('open');btn.setAttribute('aria-expanded','false')}
    function open(){updateTheme();menu.classList.add('open');btn.setAttribute('aria-expanded','true')}
    btn.addEventListener('click',e=>{e.stopPropagation();menu.classList.contains('open')?close():open()});
    menu.addEventListener('click',e=>{
      const theme=e.target.closest('[data-theme-mode]');if(theme){try{localStorage.setItem(KEY,theme.dataset.themeMode)}catch{}apply(theme.dataset.themeMode);updateTheme();return}
      const action=e.target.closest('[data-action]')?.dataset.action;
      if(action==='share'){document.getElementById('mobileOpenBtn')?.click();close()}
      if(action==='sync'){const syncBtn=document.getElementById('vssButton');if(syncBtn)syncBtn.click();else window.dispatchEvent(new CustomEvent('velnar:open-sync'));close()}
    });
    document.addEventListener('click',e=>{if(!menu.contains(e.target)&&e.target!==btn)close()});
    window.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  }
  function ensureToast(){
    if(typeof window.showToast==='function')return;
    if(!document.getElementById('velnar-global-toast-style')){const s=document.createElement('style');s.id='velnar-global-toast-style';s.textContent='.velnar-global-toast{position:fixed;left:50%;bottom:calc(22px + env(safe-area-inset-bottom));z-index:1600;transform:translate(-50%,10px);opacity:0;pointer-events:none;padding:9px 12px;border-radius:999px;background:#15161a;color:#fff;font-size:11px;box-shadow:0 6px 24px rgba(0,0,0,.14);transition:opacity 220ms ease,transform 220ms cubic-bezier(.23,1,.32,1)}.velnar-global-toast.visible{opacity:1;transform:translate(-50%,0)}@media(prefers-reduced-motion:reduce){.velnar-global-toast{transition:none!important}}';document.head.appendChild(s)}
    let el=document.getElementById('velnarGlobalToast');if(!el){el=document.createElement('div');el.id='velnarGlobalToast';el.className='velnar-global-toast';el.setAttribute('role','status');el.setAttribute('aria-live','polite');document.body.appendChild(el)}
    let timer=null;window.showToast=function(text){el.textContent=String(text||'');el.classList.add('visible');clearTimeout(timer);timer=setTimeout(()=>el.classList.remove('visible'),1600)};
  }
  function adaptMobileAccess(){
    const btn=document.getElementById('mobileOpenBtn');if(!btn)return;
    const coarse=matchMedia('(pointer:coarse)').matches;
    if(coarse){btn.textContent='分享';btn.setAttribute('aria-label','分享当前页面')}
    else{btn.textContent='手机打开';btn.setAttribute('aria-label','在手机上打开')}
  }
  function loadCollectionBridge(){
    const p=location.pathname;
    const matches=p.endsWith('/consumer-radar.html')||p.endsWith('/consumer-article.html')||p.endsWith('/deep-read.html')||p.endsWith('/deep-read-article.html');
    if(!matches||document.getElementById('velnar-collection-discussion-script')||document.querySelector('script[src="./assets/collection-discussion-bridge.js"]'))return;
    const s=document.createElement('script');s.id='velnar-collection-discussion-script';s.src='./assets/collection-discussion-bridge.js';s.async=false;document.body.appendChild(s);
  }
  function boot(){mountPicker();mountCollectionNav();mountMobileCollectionPicker();mountMobileUtilityMenu();syncStickyMetrics();ensureToast();adaptMobileAccess();loadCollectionBridge();apply(readMode())}
  apply(readMode());
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
  window.addEventListener('storage',e=>{if(e.key===KEY)apply(readMode())});
  window.__velnarAppearance={get:readMode,set:function(mode){try{localStorage.setItem(KEY,mode)}catch{}apply(mode)}};
})();
