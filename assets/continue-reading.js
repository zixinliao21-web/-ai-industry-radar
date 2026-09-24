(function continueReadingBootstrap(){
  'use strict';
  const path=location.pathname;
  const type=path.endsWith('/consumer-radar.html')?'consumer':path.endsWith('/deep-read.html')?'deep':(path.endsWith('/')||path.endsWith('/index.html'))?'industry':null;
  if(!type)return;
  const href={
    industry:id=>'./article.html?id='+encodeURIComponent(id),
    consumer:id=>'./consumer-article.html?id='+encodeURIComponent(id),
    deep:id=>'./deep-read-article.html?id='+encodeURIComponent(id)
  }[type];
  let wrap=null,tries=0;

  function catalog(){try{return typeof items!=='undefined'&&Array.isArray(items)?items:[]}catch{return[]}}
  function state(){try{return window.__velnarSync?.getState?.()||null}catch{return null}}
  function candidate(){
    const s=state(),list=catalog();if(!s||!list.length)return null;
    const prefix=type+':',records=Object.entries(s.reading||{})
      .filter(([key,v])=>key.startsWith(prefix)&&v&&Number(v.progress)>=.04&&Number(v.progress)<.97)
      .map(([key,v])=>({id:key.slice(prefix.length),progress:Number(v.progress)||0,updated_at:String(v.updated_at||'')}));
    if(!records.length)return null;
    const unread=s.read&&s.read[type]||{};
    const valid=records.filter(r=>!(unread[r.id]&&unread[r.id].value));
    if(!valid.length)return null;
    const recent=s.recent&&s.recent.collection===type?String(s.recent.article_id||''):'';
    valid.sort((a,b)=>{
      if(a.id===recent&&b.id!==recent)return-1;
      if(b.id===recent&&a.id!==recent)return 1;
      return String(b.updated_at).localeCompare(String(a.updated_at));
    });
    const rec=valid.find(r=>list.some(x=>String(x.id)===r.id));if(!rec)return null;
    const item=list.find(x=>String(x.id)===rec.id);
    return{...rec,title:String(item&&item.title||'继续上次阅读')};
  }
  function injectStyle(){
    if(document.getElementById('velnar-continue-style'))return;
    const s=document.createElement('style');s.id='velnar-continue-style';s.textContent=[
      '.vcr-wrap{margin:-18px 0 28px}.vcr-link{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:16px;padding:13px 15px;border:1px solid var(--line);border-radius:14px;background:var(--card);color:var(--text);text-decoration:none;outline:none}.vcr-eyebrow{font-size:9px;font-weight:760;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}.vcr-title{margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:680}.vcr-meta{display:flex;align-items:center;gap:8px;color:var(--muted);font-size:10px;font-variant-numeric:tabular-nums;white-space:nowrap}.vcr-track{width:56px;height:3px;border-radius:999px;background:var(--line);overflow:hidden}.vcr-fill{height:100%;background:var(--accent);transform-origin:left}.vcr-link:focus-visible{box-shadow:0 0 0 3px rgba(57,110,227,.16),0 0 0 1px rgba(57,110,227,.48)}',
      '@media(hover:hover) and (pointer:fine){.vcr-link:hover{border-color:var(--line-strong);background:var(--soft)}}',
      '@media(max-width:640px){.vcr-wrap{margin:-6px 0 16px}.vcr-link{min-height:44px;padding:8px 10px;gap:10px;border-radius:12px}.vcr-eyebrow{font-size:8.5px}.vcr-title{font-size:11.5px;margin-top:3px}.vcr-track{width:42px}}',
      '@media(prefers-reduced-motion:reduce){.vcr-link{transition:none!important}}'
    ].join('');document.head.appendChild(s);
  }
  function render(){
    const c=candidate();
    if(!c){if(wrap)wrap.hidden=true;return false}
    if(!wrap){
      injectStyle();wrap=document.createElement('div');wrap.className='vcr-wrap';
      const hero=document.querySelector('.hero');if(!hero)return false;
      hero.insertAdjacentElement('afterend',wrap);
    }
    const pct=Math.max(4,Math.min(96,Math.round(c.progress*100)));
    wrap.hidden=false;
    wrap.innerHTML='<a class="vcr-link" href="'+href(c.id)+'&resume=1" aria-label="继续阅读 '+escapeHtml(c.title)+'，已读 '+pct+'%"><div><div class="vcr-eyebrow">继续阅读 · Continue</div><div class="vcr-title">'+escapeHtml(c.title)+'</div></div><div class="vcr-meta"><span>'+pct+'%</span><span class="vcr-track" aria-hidden="true"><span class="vcr-fill" style="transform:scaleX('+(pct/100)+')"></span></span><span aria-hidden="true">›</span></div></a>';
    return true;
  }
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  window.addEventListener('velnar:sync-applied',()=>setTimeout(render,0));
  window.addEventListener('pageshow',()=>setTimeout(render,0));
  const timer=setInterval(()=>{tries++;if(render()||tries>100)clearInterval(timer)},120);
})();