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
  apply(readMode());
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{mountPicker();apply(readMode())},{once:true});
  else{mountPicker();apply(readMode())}
  window.addEventListener('storage',e=>{if(e.key===KEY)apply(readMode())});
  window.__velnarAppearance={get:readMode,set:function(mode){try{localStorage.setItem(KEY,mode)}catch{}apply(mode)}};
})();
