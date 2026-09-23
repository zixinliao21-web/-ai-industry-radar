(function stateSyncBootstrap(){
  'use strict';
  if(window.__velnarSync)return;
  const CONFIG_KEY='velnar-sync-config-v1';
  const STATE_KEY='velnar-sync-state-v1';
  const DEVICE_KEY='velnar-sync-device-v1';
  const READING_KEY='velnar-reading-progress-v1';
  const READER_PROGRESS_KEY='velnar-reader-progress-v1';
  const READER_RATE_KEY='velnar-reader-rate-v1';
  const READER_VOICE_KEY='velnar-reader-voice-v1';
  const READ_KEYS={industry:'ai-industry-radar-read-v1',consumer:'velnar-consumer-radar-read-v1',deep:'velnar-deep-read-read-v1'};
  const path=location.pathname;
  const collection=path.endsWith('/consumer-radar.html')||path.endsWith('/consumer-article.html')?'consumer':
    path.endsWith('/deep-read.html')||path.endsWith('/deep-read-article.html')?'deep':
    (path.endsWith('/')||path.endsWith('/index.html')||path.endsWith('/article.html'))?'industry':null;
  const isArticle=/\/(?:article|consumer-article|deep-read-article)\.html$/.test(path);
  let syncTimer=null,syncing=false,articleKey='',restoreDone=false,scrollTimer=null,localState=null;

  function now(){return new Date().toISOString()}
  function time(v){const n=Date.parse(String(v||''));return Number.isFinite(n)?n:0}
  function randomId(prefix){
    try{const a=new Uint8Array(12);crypto.getRandomValues(a);return prefix+Array.from(a,x=>x.toString(16).padStart(2,'0')).join('')}
    catch{return prefix+Math.random().toString(36).slice(2)+Date.now().toString(36)}
  }
  function readJson(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'');return v??fallback}catch{return fallback}}
  function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}
  function readString(key){try{return localStorage.getItem(key)||''}catch{return''}}
  function writeString(key,value){try{if(value==null||value==='')localStorage.removeItem(key);else localStorage.setItem(key,String(value));return true}catch{return false}}
  function emptyState(){return{version:1,updated_at:'',read:{industry:{},consumer:{},deep:{}},recent:null,reading:{},reader:{progress:{},rate:null,voice:null}}}
  function normalizeState(raw){
    const s=emptyState();
    if(!raw||typeof raw!=='object')return s;
    ['industry','consumer','deep'].forEach(c=>{
      const src=raw.read&&raw.read[c];
      if(src&&typeof src==='object'&&!Array.isArray(src))Object.entries(src).forEach(([id,v])=>{if(v&&typeof v==='object')s.read[c][id]={value:!!v.value,updated_at:String(v.updated_at||'')}});
    });
    if(raw.recent&&typeof raw.recent==='object')s.recent={collection:String(raw.recent.collection||''),article_id:String(raw.recent.article_id||''),updated_at:String(raw.recent.updated_at||'')};
    if(raw.reading&&typeof raw.reading==='object'&&!Array.isArray(raw.reading))Object.entries(raw.reading).forEach(([key,v])=>{
      if(v&&typeof v==='object')s.reading[key]={progress:Math.max(0,Math.min(1,Number(v.progress)||0)),updated_at:String(v.updated_at||'')};
    });
    const rp=raw.reader&&raw.reader.progress;
    if(rp&&typeof rp==='object'&&!Array.isArray(rp))Object.entries(rp).forEach(([key,v])=>{
      if(v&&typeof v==='object')s.reader.progress[key]={index:Math.max(0,Number(v.index)||0),completed:!!v.completed,fingerprint:String(v.fingerprint||''),updated_at:String(v.updated_at||'')};
    });
    ['rate','voice'].forEach(k=>{const v=raw.reader&&raw.reader[k];if(v&&typeof v==='object')s.reader[k]={value:String(v.value??''),updated_at:String(v.updated_at||'')}});
    s.updated_at=String(raw.updated_at||'');return s;
  }
  function deviceId(){let id=readString(DEVICE_KEY);if(!id){id=randomId('d_');writeString(DEVICE_KEY,id)}return id}
  function readLegacySet(c){try{const v=JSON.parse(localStorage.getItem(READ_KEYS[c])||'[]');return new Set(Array.isArray(v)?v.map(String):[])}catch{return new Set()}}
  function persistState(state){state.updated_at=now();localState=normalizeState(state);writeJson(STATE_KEY,localState);return localState}
  function initializeState(){
    let state=normalizeState(readJson(STATE_KEY,null));const stamp=now();
    ['industry','consumer','deep'].forEach(c=>{for(const id of readLegacySet(c)){if(!state.read[c][id])state.read[c][id]={value:true,updated_at:stamp}}});
    const existingProgress=readJson(READER_PROGRESS_KEY,{});
    if(existingProgress&&typeof existingProgress==='object')Object.entries(existingProgress).forEach(([key,v])=>{
      if(!v||typeof v!=='object')return;
      const candidate={index:Math.max(0,Number(v.index)||0),completed:!!v.completed,fingerprint:String(v.fingerprint||''),updated_at:String(v.updated_at||stamp)};
      const old=state.reader.progress[key];
      if(!old||time(candidate.updated_at)>=time(old.updated_at)||candidate.index>old.index)state.reader.progress[key]=candidate;
    });
    const rate=readString(READER_RATE_KEY),voice=readString(READER_VOICE_KEY);
    if(rate&&!state.reader.rate)state.reader.rate={value:rate,updated_at:stamp};
    if(voice&&!state.reader.voice)state.reader.voice={value:voice,updated_at:stamp};
    return persistState(state);
  }
  function newer(a,b){return time(a&&a.updated_at)>=time(b&&b.updated_at)?a:b}
  function mergeStates(states){
    const out=emptyState();
    states.map(normalizeState).forEach(s=>{
      ['industry','consumer','deep'].forEach(c=>Object.entries(s.read[c]).forEach(([id,rec])=>{
        const old=out.read[c][id];if(!old||time(rec.updated_at)>time(old.updated_at))out.read[c][id]={...rec};
      }));
      if(s.recent&&(!out.recent||time(s.recent.updated_at)>time(out.recent.updated_at)))out.recent={...s.recent};
      Object.entries(s.reading).forEach(([key,rec])=>{
        const old=out.reading[key];
        out.reading[key]=!old?{...rec}:{progress:Math.max(old.progress,rec.progress),updated_at:time(rec.updated_at)>=time(old.updated_at)?rec.updated_at:old.updated_at};
      });
      Object.entries(s.reader.progress).forEach(([key,rec])=>{
        const old=out.reader.progress[key];
        if(!old){out.reader.progress[key]={...rec};return}
        if(old.fingerprint&&rec.fingerprint&&old.fingerprint===rec.fingerprint){
          out.reader.progress[key]={index:Math.max(old.index,rec.index),completed:old.completed||rec.completed,fingerprint:old.fingerprint,updated_at:time(rec.updated_at)>=time(old.updated_at)?rec.updated_at:old.updated_at};
        }else out.reader.progress[key]={...(time(rec.updated_at)>time(old.updated_at)?rec:old)};
      });
      if(s.reader.rate)out.reader.rate=out.reader.rate?{...newer(s.reader.rate,out.reader.rate)}:{...s.reader.rate};
      if(s.reader.voice)out.reader.voice=out.reader.voice?{...newer(s.reader.voice,out.reader.voice)}:{...s.reader.voice};
    });
    out.updated_at=now();return out;
  }
  function applyState(state,source){
    const s=normalizeState(state);
    ['industry','consumer','deep'].forEach(c=>writeJson(READ_KEYS[c],Object.entries(s.read[c]).filter(([,v])=>v.value).map(([id])=>id).sort()));
    writeJson(READING_KEY,s.reading);writeJson(READER_PROGRESS_KEY,s.reader.progress);
    if(s.reader.rate&&s.reader.rate.value)writeString(READER_RATE_KEY,s.reader.rate.value);
    if(s.reader.voice&&s.reader.voice.value)writeString(READER_VOICE_KEY,s.reader.voice.value);
    localState=s;writeJson(STATE_KEY,s);
    window.dispatchEvent(new CustomEvent('velnar:sync-applied',{detail:{source:source||'local',state:s}}));
    tryRestoreReading();
  }
  function scheduleSync(delay){if(!getConfig())return;clearTimeout(syncTimer);syncTimer=setTimeout(()=>syncNow(false),typeof delay==='number'?delay:1400)}
  function setRead(c,id,value){
    if(!c||!id)return;const s=normalizeState(localState||initializeState());
    s.read[c][String(id)]={value:!!value,updated_at:now()};persistState(s);scheduleSync();
  }
  function markOpened(c,id){
    if(!c||!id)return;const s=normalizeState(localState||initializeState());
    s.recent={collection:c,article_id:String(id),updated_at:now()};persistState(s);scheduleSync(1800);
  }
  function markReading(progress){
    if(!articleKey)return;const p=Math.max(0,Math.min(1,Number(progress)||0));if(p<.015)return;
    const s=normalizeState(localState||initializeState()),old=s.reading[articleKey];
    if(old&&p<=old.progress+.002)return;
    s.reading[articleKey]={progress:Math.max(p,old?old.progress:0),updated_at:now()};persistState(s);scheduleSync(2200);
  }
  function captureReaderState(){
    const s=normalizeState(localState||initializeState()),stamp=now(),progress=readJson(READER_PROGRESS_KEY,{});
    if(progress&&typeof progress==='object')Object.entries(progress).forEach(([key,v])=>{
      if(!v||typeof v!=='object')return;
      const candidate={index:Math.max(0,Number(v.index)||0),completed:!!v.completed,fingerprint:String(v.fingerprint||''),updated_at:String(v.updated_at||stamp)},old=s.reader.progress[key];
      if(!old||candidate.index>old.index||time(candidate.updated_at)>time(old.updated_at))s.reader.progress[key]=candidate;
    });
    const rate=readString(READER_RATE_KEY),voice=readString(READER_VOICE_KEY);
    if(rate&&(!s.reader.rate||s.reader.rate.value!==rate))s.reader.rate={value:rate,updated_at:stamp};
    if(voice&&(!s.reader.voice||s.reader.voice.value!==voice))s.reader.voice={value:voice,updated_at:stamp};
    persistState(s);scheduleSync();
  }
  function getConfig(){
    const c=readJson(CONFIG_KEY,null);
    if(!c||c.provider!=='upstash'||!/^https:\/\//i.test(String(c.url||''))||!String(c.token||'')||!String(c.key||''))return null;
    return{provider:'upstash',url:String(c.url).replace(/\/+$/,''),token:String(c.token),key:String(c.key)};
  }
  function saveConfig(c){writeJson(CONFIG_KEY,c);updateUiStatus();return c}
  async function redisCommand(args){
    const c=getConfig();if(!c)throw new Error('Sync not configured');
    const r=await fetch(c.url,{method:'POST',headers:{'Authorization':'Bearer '+c.token,'Content-Type':'application/json'},body:JSON.stringify(args),cache:'no-store'});
    let data=null;try{data=await r.json()}catch{}
    if(!r.ok||!data||data.error)throw new Error((data&&data.error)||('HTTP '+r.status));
    return data.result;
  }
  async function pushLocal(){const c=getConfig();if(c)await redisCommand(['HSET',c.key,deviceId(),JSON.stringify(localState||initializeState())])}
  async function pullAll(){
    const c=getConfig();if(!c)return[];const result=await redisCommand(['HGETALL',c.key]);if(!Array.isArray(result))return[];
    const states=[];for(let i=1;i<result.length;i+=2){try{const v=JSON.parse(result[i]);if(v&&typeof v==='object')states.push(v)}catch{}}return states;
  }
  async function syncNow(manual){
    if(syncing)return false;if(!getConfig()){setStatus('off','未连接');return false}
    syncing=true;setStatus('syncing','同步中…');
    try{
      await pushLocal();const remote=await pullAll();const merged=mergeStates([localState||initializeState(),...remote]);
      applyState(merged,'cloud');setStatus('ok','已同步 '+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}));syncing=false;return true;
    }catch(err){setStatus('error','同步失败');if(manual)showInline(String(err&&err.message||err));syncing=false;return false}
  }
  function encodeSetup(config){
    const raw=JSON.stringify({v:1,p:'upstash',u:config.url,t:config.token,k:config.key}),bytes=new TextEncoder().encode(raw);let bin='';
    bytes.forEach(b=>bin+=String.fromCharCode(b));return'VRS1.'+btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function decodeSetup(code){
    const s=String(code||'').trim();if(!s.startsWith('VRS1.'))throw new Error('连接码格式不正确');
    let b=s.slice(5).replace(/-/g,'+').replace(/_/g,'/');while(b.length%4)b+='=';
    const bin=atob(b),bytes=Uint8Array.from(bin,c=>c.charCodeAt(0)),x=JSON.parse(new TextDecoder().decode(bytes));
    if(x.v!==1||x.p!=='upstash'||!/^https:\/\//i.test(String(x.u||''))||!x.t||!x.k)throw new Error('连接码内容不完整');
    return{provider:'upstash',url:String(x.u).replace(/\/+$/,''),token:String(x.t),key:String(x.k)};
  }
  async function copyText(v){try{await navigator.clipboard.writeText(v);return true}catch{return false}}
  function setStatus(kind,text){const dot=document.querySelector('.vss-dot'),label=document.getElementById('vssStatus');if(dot)dot.dataset.state=kind;if(label)label.textContent=text||''}
  function showInline(text){const el=document.getElementById('vssMessage');if(el)el.textContent=text||''}
  function updateUiStatus(){
    const c=getConfig(),url=document.getElementById('vssUrl'),token=document.getElementById('vssToken'),syncBtn=document.getElementById('vssSyncNow'),copyBtn=document.getElementById('vssCopyCode'),disconnect=document.getElementById('vssDisconnect');
    if(url)url.value=c?c.url:'';if(token)token.value=c?c.token:'';[syncBtn,copyBtn,disconnect].forEach(b=>{if(b)b.disabled=!c});setStatus(c?'idle':'off',c?'已连接，等待同步':'未连接');
  }
  function mountUi(){
    if(document.getElementById('vssButton'))return;const bar=document.querySelector('.brandbar');if(!bar)return;injectStyle();
    const btn=document.createElement('button');btn.type='button';btn.id='vssButton';btn.className='vss-button';btn.innerHTML='<span class="vss-dot" data-state="off"></span><span>同步</span>';btn.setAttribute('aria-label','跨设备同步设置');
    const actions=bar.querySelector('.brand-actions')||bar;actions.appendChild(btn);
    const layer=document.createElement('div');layer.id='vssLayer';layer.className='vss-layer';layer.setAttribute('aria-hidden','true');
    layer.innerHTML='<section class="vss-panel" role="dialog" aria-modal="true" aria-labelledby="vssTitle"><div class="vss-head"><div><div class="vss-title" id="vssTitle">跨设备同步</div><div class="vss-sub" id="vssStatus">未连接</div></div><button class="vss-close" id="vssClose" type="button" aria-label="关闭">×</button></div><div class="vss-body"><p class="vss-copy">同步已读状态、最近打开、阅读进度和朗读进度/偏好。笔记与摘录仍只保存在当前设备。</p><label>Upstash REST URL<input id="vssUrl" type="url" inputmode="url" placeholder="https://…upstash.io"></label><label>REST Token<input id="vssToken" type="password" autocomplete="off" placeholder="Token"></label><div class="vss-actions"><button id="vssConnect" type="button">保存并连接</button><button id="vssSyncNow" type="button">立即同步</button></div><div class="vss-rule"></div><label>另一台设备的连接码<textarea id="vssImport" rows="3" placeholder="VRS1.…"></textarea></label><div class="vss-actions"><button id="vssImportBtn" type="button">导入连接码</button><button id="vssCopyCode" type="button">复制本机连接码</button></div><p class="vss-warning">连接码包含数据库访问凭据，等同同步密码，只在自己的设备之间传递。建议为 Radar 使用独立的 Upstash 数据库。</p><div class="vss-message" id="vssMessage" aria-live="polite"></div><button class="vss-disconnect" id="vssDisconnect" type="button">断开此设备</button></div></section>';
    document.body.appendChild(layer);
    function open(){updateUiStatus();showInline('');layer.classList.add('open');layer.setAttribute('aria-hidden','false')}
    function close(){layer.classList.remove('open');layer.setAttribute('aria-hidden','true')}
    btn.addEventListener('click',open);document.getElementById('vssClose').addEventListener('click',close);layer.addEventListener('click',e=>{if(e.target===layer)close()});
    document.getElementById('vssConnect').addEventListener('click',async()=>{
      const url=document.getElementById('vssUrl').value.trim().replace(/\/+$/,''),token=document.getElementById('vssToken').value.trim();
      if(!/^https:\/\//i.test(url)||!token){showInline('请填写完整的 HTTPS REST URL 和 Token。');return}
      const old=getConfig();saveConfig({provider:'upstash',url,token,key:old&&old.key?old.key:randomId('velnar:sync:v1:')});
      showInline('正在验证连接…');const ok=await syncNow(true);if(ok)showInline('连接成功。本机状态已经进入同步。');
    });
    document.getElementById('vssSyncNow').addEventListener('click',async()=>{showInline('正在同步…');const ok=await syncNow(true);if(ok)showInline('同步完成。')});
    document.getElementById('vssCopyCode').addEventListener('click',async()=>{const c=getConfig();if(!c)return;const ok=await copyText(encodeSetup(c));showInline(ok?'连接码已复制。请只发送到自己的另一台设备。':'复制失败，请检查剪贴板权限。')});
    document.getElementById('vssImportBtn').addEventListener('click',async()=>{
      const input=document.getElementById('vssImport');
      try{const c=decodeSetup(input.value);saveConfig(c);input.value='';updateUiStatus();showInline('连接码已导入并已从输入框清除，正在同步…');const ok=await syncNow(true);if(ok)showInline('同步完成。')}catch(err){showInline(String(err&&err.message||err))}
    });
    document.getElementById('vssDisconnect').addEventListener('click',()=>{try{localStorage.removeItem(CONFIG_KEY)}catch{}updateUiStatus();showInline('已断开云同步。本地阅读状态仍保留。')});
    updateUiStatus();
  }
  function injectStyle(){
    if(document.getElementById('vssStyle'))return;const s=document.createElement('style');s.id='vssStyle';s.textContent=[
      '.vss-button{display:inline-flex;align-items:center;gap:6px;min-height:34px;padding:7px 9px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--muted);font:650 10px/1 -apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang SC","Helvetica Neue",Arial,sans-serif;cursor:pointer}',
      '.vss-dot{width:6px;height:6px;border-radius:50%;background:#a5a8b0}.vss-dot[data-state="ok"]{background:#35a853}.vss-dot[data-state="syncing"]{background:var(--accent)}.vss-dot[data-state="error"]{background:#c95a5a}',
      '.vss-layer{position:fixed;inset:0;z-index:1700;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(10,11,15,.28)}.vss-layer.open{display:flex}.vss-panel{width:min(440px,96vw);max-height:88vh;overflow:auto;background:var(--card);border:1px solid var(--line);border-radius:18px;box-shadow:0 24px 80px rgba(10,11,15,.18);color:var(--text)}',
      '.vss-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:18px 18px 13px;border-bottom:1px solid var(--line)}.vss-title{font-size:14px;font-weight:760}.vss-sub{margin-top:4px;font-size:10px;color:var(--muted)}.vss-close{width:34px;height:34px;border:1px solid var(--line);border-radius:50%;background:var(--soft);color:var(--text);font-size:18px;cursor:pointer}',
      '.vss-body{padding:16px 18px 18px}.vss-copy,.vss-warning{margin:0 0 14px;font-size:10.5px;line-height:1.65;color:var(--muted)}.vss-warning{margin-top:12px}.vss-body label{display:grid;gap:6px;margin:11px 0;font-size:10px;color:var(--muted)}.vss-body input,.vss-body textarea{width:100%;box-sizing:border-box;border:1px solid var(--line);border-radius:10px;background:var(--soft);color:var(--text);padding:9px 10px;font:500 11px/1.45 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;outline:none}',
      '.vss-actions{display:flex;gap:8px;flex-wrap:wrap}.vss-actions button,.vss-disconnect{min-height:36px;padding:8px 11px;border:1px solid var(--line);border-radius:10px;background:var(--soft);color:var(--text);font:650 10.5px/1 -apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang SC","Helvetica Neue",Arial,sans-serif;cursor:pointer}.vss-actions button:disabled,.vss-disconnect:disabled{opacity:.4}.vss-rule{height:1px;background:var(--line);margin:16px 0}.vss-message{min-height:18px;font-size:10px;line-height:1.55;color:var(--muted);margin-top:10px}.vss-disconnect{margin-top:8px;background:transparent}',
      '@media(max-width:640px){.vss-button span:last-child{display:none}.vss-button{width:36px;justify-content:center;padding:0}.vss-panel{width:100%;border-radius:16px}.vss-layer{align-items:flex-end;padding:10px}.vss-panel{max-height:92vh}}'
    ].join('');document.head.appendChild(s);
  }
  function resolveArticle(){
    if(!isArticle||!collection)return false;let id=new URLSearchParams(location.search).get('id')||'';
    try{if(!id&&window.currentItem&&window.currentItem.id)id=String(window.currentItem.id)}catch{}
    if(!id)return false;articleKey=collection+':'+id;markOpened(collection,id);tryRestoreReading();return true;
  }
  function tryRestoreReading(){
    if(restoreDone||!articleKey||location.hash||scrollY>80)return;
    const progress=(localState&&localState.reading&&localState.reading[articleKey]&&localState.reading[articleKey].progress)||0;
    if(progress<.04||progress>.97)return;
    const article=document.querySelector('#articleRoot .article');if(!article)return;restoreDone=true;
    setTimeout(()=>{const max=Math.max(0,document.documentElement.scrollHeight-innerHeight);if(max>0)window.scrollTo(0,Math.round(max*progress))},180);
  }
  function setupArticleTracking(){
    if(!isArticle)return;let tries=0;const t=setInterval(()=>{tries++;if(resolveArticle()||tries>80)clearInterval(t)},120);
    window.addEventListener('scroll',()=>{if(!articleKey)return;clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);markReading(scrollY/max)},700)},{passive:true});
    window.addEventListener('pagehide',()=>{if(articleKey){const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);markReading(scrollY/max)}});
  }
  function boot(){
    localState=initializeState();mountUi();setupArticleTracking();
    window.addEventListener('velnar:local-state-changed',captureReaderState);
    window.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')syncNow(false)});
    window.addEventListener('focus',()=>syncNow(false));
    if(getConfig())syncNow(false);
    setInterval(()=>{if(document.visibilityState==='visible'&&getConfig())syncNow(false)},60000);
  }
  window.__velnarSync={setRead:setRead,syncNow:()=>syncNow(true),getState:()=>normalizeState(localState||initializeState()),getConfig:getConfig};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();