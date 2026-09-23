(function completionBootstrap(){
  'use strict';
  const path=location.pathname;
  const type=path.endsWith('/consumer-article.html')?'consumer':path.endsWith('/deep-read-article.html')?'deep':path.endsWith('/article.html')?'industry':null;
  if(!type)return;
  const config={
    industry:{readKey:'ai-industry-radar-read-v1',href:id=>'./article.html?id='+encodeURIComponent(id),sort:(a,b)=>String(b.date||'').localeCompare(String(a.date||''))||(({S:0,A:1,B:2}[a.grade]??9)-({S:0,A:1,B:2}[b.grade]??9))},
    consumer:{readKey:'velnar-consumer-radar-read-v1',href:id=>'./consumer-article.html?id='+encodeURIComponent(id),sort:(a,b)=>String(b.date||'').localeCompare(String(a.date||''))},
    deep:{readKey:'velnar-deep-read-read-v1',href:id=>'./deep-read-article.html?id='+encodeURIComponent(id),sort:(a,b)=>String(b.added_date||'').localeCompare(String(a.added_date||''))||String(b.id||'').localeCompare(String(a.id||''))}
  }[type];
  let mounted=false,panel=null,toggleBtn=null,nextLink=null,status=null;

  function item(){try{return typeof currentItem!=='undefined'?currentItem:null}catch{return null}}
  function items(){try{return typeof allItems!=='undefined'&&Array.isArray(allItems)?allItems:[]}catch{return[]}}
  function readSet(){try{const v=JSON.parse(localStorage.getItem(config.readKey)||'[]');return new Set(Array.isArray(v)?v.map(String):[])}catch{return new Set()}}
  function writeSet(set){try{localStorage.setItem(config.readKey,JSON.stringify([...set]));return true}catch{return false}}
  function nextUnread(currentId,set){
    const sorted=[...items()].sort(config.sort),i=sorted.findIndex(x=>String(x.id)===String(currentId));
    const after=i>=0?sorted.slice(i+1):sorted;
    return after.find(x=>!set.has(String(x.id)))||sorted.find(x=>String(x.id)!==String(currentId)&&!set.has(String(x.id)))||null;
  }
  function syncTopButton(isRead){
    const btn=document.getElementById(type==='industry'?'stateBtn':'readBtn');
    if(btn)btn.textContent=isRead?'标记未读':'标记已读';
  }
  function render(){
    const current=item();if(!current||!panel)return;
    const set=readSet(),id=String(current.id||''),isRead=set.has(id),next=nextUnread(id,set);
    toggleBtn.textContent=isRead?'已读 · 标记未读':'标记已读';
    toggleBtn.dataset.read=isRead?'true':'false';
    status.textContent=isRead?'已完成本篇阅读':'读完后标记，可让未读队列保持干净';
    if(next){nextLink.hidden=false;nextLink.href=config.href(next.id);nextLink.textContent='下一篇未读 →'}
    else{nextLink.hidden=false;nextLink.removeAttribute('href');nextLink.textContent='当前板块已全部读完';nextLink.setAttribute('aria-disabled','true')}
    syncTopButton(isRead);
  }
  function toggle(){
    const current=item();if(!current)return;
    const id=String(current.id||''),set=readSet(),wasRead=set.has(id);
    if(wasRead)set.delete(id);else set.add(id);
    writeSet(set);
    window.__velnarSync?.setRead(type,id,!wasRead);
    render();
    if(typeof window.showToast==='function')window.showToast(wasRead?'已标记未读':'已标记已读');
  }
  function injectStyle(){
    if(document.getElementById('velnar-completion-style'))return;
    const s=document.createElement('style');s.id='velnar-completion-style';s.textContent=[
      '.vrc-wrap{max-width:900px;margin:16px auto 0}.vrc-panel{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:16px 18px;border:1px solid var(--line);border-radius:16px;background:var(--card);color:var(--text)}',
      '.vrc-copy{min-width:0}.vrc-label{font-size:10px;font-weight:760;letter-spacing:.08em;text-transform:uppercase;color:var(--text)}.vrc-status{margin-top:5px;font-size:10px;line-height:1.5;color:var(--muted)}',
      '.vrc-actions{display:flex;align-items:center;gap:8px;flex:0 0 auto}.vrc-toggle,.vrc-next{min-height:40px;border:1px solid var(--line);border-radius:999px;padding:9px 13px;background:var(--soft);color:var(--text);font:650 10.5px/1 -apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang SC","Helvetica Neue",Arial,sans-serif;text-decoration:none;cursor:pointer;white-space:nowrap}.vrc-toggle[data-read="false"]{background:var(--text);color:var(--bg);border-color:var(--text)}.vrc-next[aria-disabled="true"]{opacity:.48;pointer-events:none}',
      '.vrc-toggle:focus-visible,.vrc-next:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(57,110,227,.16),0 0 0 1px rgba(57,110,227,.48)}',
      '@media(hover:hover) and (pointer:fine){.vrc-toggle:hover,.vrc-next:hover{border-color:var(--line-strong)}}',
      '@media(max-width:640px){.vrc-panel{align-items:stretch;flex-direction:column;padding:14px}.vrc-actions{display:grid;grid-template-columns:1fr 1fr}.vrc-toggle,.vrc-next{text-align:center;display:grid;place-items:center;min-height:44px;padding:10px 9px}}',
      '@media(prefers-reduced-motion:reduce){.vrc-toggle,.vrc-next{transition:none!important}}'
    ].join('');document.head.appendChild(s);
  }
  function mount(){
    if(mounted)return true;
    const root=document.getElementById('articleRoot'),article=root&&root.querySelector('.article'),current=item();
    if(!article||!current)return false;
    injectStyle();
    panel=document.createElement('div');panel.className='vrc-wrap';
    panel.innerHTML='<section class="vrc-panel" aria-label="阅读完成操作"><div class="vrc-copy"><div class="vrc-label">Reading complete</div><div class="vrc-status"></div></div><div class="vrc-actions"><button class="vrc-toggle" type="button"></button><a class="vrc-next"></a></div></section>';
    root.insertAdjacentElement('afterend',panel);
    toggleBtn=panel.querySelector('.vrc-toggle');nextLink=panel.querySelector('.vrc-next');status=panel.querySelector('.vrc-status');
    toggleBtn.addEventListener('click',toggle);
    const topBtn=document.getElementById(type==='industry'?'stateBtn':'readBtn');
    if(topBtn)topBtn.addEventListener('click',()=>setTimeout(render,0));
    window.addEventListener('velnar:sync-applied',render);
    mounted=true;render();return true;
  }
  if(!mount()){let tries=0,t=setInterval(()=>{tries++;if(mount()||tries>100)clearInterval(t)},120)}
})();