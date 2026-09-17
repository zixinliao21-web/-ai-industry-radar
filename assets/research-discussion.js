(function(){
'use strict';

const NOTES_KEY='velnar-radar-notes-v1';
const THREAD_KEY='velnar-radar-discussion-url-v1';
const NOTE_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h10a2 2 0 0 1 2 2v15H8a3 3 0 0 1-3-3v-12a2 2 0 0 1 2-2Z"/><path d="M8 3.5v17M11 8h5M11 12h5M11 16h3"/></svg>';
const CHAT_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4.5 3v-3H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z"/></svg>';
const CLOSE_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';

function injectStyles(){
  if(document.getElementById('velnar-research-discussion-style'))return;
  const s=document.createElement('style');
  s.id='velnar-research-discussion-style';
  s.textContent=`
  .velnar-icon-btn{position:relative;width:40px;height:40px;display:grid;place-items:center;padding:0!important;border-radius:999px!important}.velnar-icon-btn svg,.velnar-selection-note svg,.velnar-note-badge svg,.velnar-panel-icon svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.velnar-icon-btn.has-note::after{content:"";position:absolute;right:5px;top:5px;width:6px;height:6px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 2px var(--bg)}
  .velnar-discuss-btn{display:inline-flex;align-items:center;gap:7px}.velnar-discuss-btn svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
  .velnar-notes-layer{position:fixed;inset:0;z-index:1180;background:rgba(12,13,17,.2);opacity:0;pointer-events:none;transition:opacity 180ms ease}.velnar-notes-layer.visible{opacity:1;pointer-events:auto}.velnar-notes-panel{position:absolute;top:0;right:0;width:min(420px,92vw);height:100%;display:flex;flex-direction:column;background:var(--card);color:var(--text);border-left:1px solid var(--line);box-shadow:-24px 0 80px rgba(8,10,18,.14);transform:translateX(18px);transition:transform 220ms cubic-bezier(.23,1,.32,1)}.velnar-notes-layer.visible .velnar-notes-panel{transform:translateX(0)}
  .velnar-notes-head{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:max(18px,env(safe-area-inset-top)) 20px 14px;border-bottom:1px solid var(--line)}.velnar-notes-title{display:flex;align-items:center;gap:10px;font-size:14px;font-weight:720}.velnar-panel-icon{display:grid;place-items:center;width:30px;height:30px;border:1px solid var(--line);border-radius:9px;color:var(--muted)}.velnar-notes-close{width:36px;height:36px;display:grid;place-items:center;border:1px solid var(--line);border-radius:50%;background:transparent;color:var(--muted);cursor:pointer}.velnar-notes-close svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.8}
  .velnar-notes-body{overflow:auto;padding:18px 20px calc(24px + env(safe-area-inset-bottom));display:grid;gap:18px}.velnar-notes-article{font-size:11px;line-height:1.5;color:var(--muted)}.velnar-notes-article strong{display:block;margin-top:4px;color:var(--text);font-size:13px;line-height:1.45}.velnar-note-area{width:100%;min-height:180px;resize:vertical;border:1px solid var(--line);border-radius:14px;background:var(--soft);color:var(--text);padding:14px;font:400 14px/1.7 -apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang SC","Helvetica Neue",Arial,sans-serif;outline:none}.velnar-note-area:focus{border-color:var(--line-strong);box-shadow:0 0 0 3px rgba(57,110,227,.09)}.velnar-note-status{margin-top:7px;font-size:10px;color:var(--muted)}
  .velnar-quote-title,.velnar-setting-title{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700;margin-bottom:8px}.velnar-quotes{display:grid;gap:8px}.velnar-quote{position:relative;padding:12px 34px 12px 13px;border:1px solid var(--line);border-radius:12px;background:var(--soft);font-size:12px;line-height:1.6;color:var(--text)}.velnar-quote-source{display:block;margin-bottom:5px;font-size:9.5px;color:var(--muted)}.velnar-quote-remove{position:absolute;right:8px;top:8px;width:24px;height:24px;border:0;background:transparent;color:var(--muted);cursor:pointer;font-size:16px}.velnar-empty-quotes{font-size:11px;color:var(--muted);padding:3px 0}
  .velnar-discussion-block{padding-top:4px;border-top:1px solid var(--line)}.velnar-thread-input{width:100%;border:1px solid var(--line);border-radius:11px;background:var(--soft);color:var(--text);padding:10px 11px;font-size:11px;outline:none}.velnar-thread-input:focus{border-color:var(--line-strong)}.velnar-thread-hint{margin-top:6px;color:var(--muted);font-size:9.5px;line-height:1.5}.velnar-panel-discuss{margin-top:12px;width:100%;min-height:44px;border:1px solid var(--text);border-radius:12px;background:var(--text);color:var(--bg);font-size:12px;font-weight:700;cursor:pointer}
  .velnar-selection-note{position:fixed;z-index:1195;width:34px;height:34px;display:none;place-items:center;border:1px solid var(--line-strong);border-radius:10px;background:var(--card);color:var(--text);box-shadow:0 8px 28px rgba(12,14,20,.15);cursor:pointer}.velnar-selection-note.visible{display:grid}.velnar-selection-note:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(57,110,227,.18),0 8px 28px rgba(12,14,20,.15)}
  .velnar-note-badge{display:inline-flex;align-items:center;color:var(--accent);vertical-align:middle;margin-left:3px}.velnar-note-badge svg{width:11px;height:11px}
  @media(prefers-color-scheme:dark){html:not([data-theme="light"]) .velnar-notes-panel,html:not([data-theme="light"]) .velnar-selection-note{background:#17191f}html:not([data-theme="light"]) .velnar-note-area,html:not([data-theme="light"]) .velnar-quote,html:not([data-theme="light"]) .velnar-thread-input{background:#14161b}}
  html[data-theme="dark"] .velnar-notes-panel,html[data-theme="dark"] .velnar-selection-note{background:#17191f}html[data-theme="dark"] .velnar-note-area,html[data-theme="dark"] .velnar-quote,html[data-theme="dark"] .velnar-thread-input{background:#14161b}
  @media(max-width:640px){.velnar-notes-layer{display:grid;align-items:end}.velnar-notes-panel{position:relative;top:auto;right:auto;width:100%;height:min(78dvh,720px);border-left:0;border-top:1px solid var(--line);border-radius:22px 22px 0 0;transform:translateY(18px)}.velnar-notes-layer.visible .velnar-notes-panel{transform:translateY(0)}.velnar-notes-head{padding:15px 16px 12px}.velnar-notes-body{padding:15px 16px calc(18px + env(safe-area-inset-bottom))}.velnar-note-area{min-height:150px}.velnar-discuss-btn span{display:none}}
  @media(prefers-reduced-motion:reduce){.velnar-notes-layer,.velnar-notes-panel{transition:none!important}.velnar-notes-panel{transform:none!important}}
  `;
  document.head.appendChild(s);
}

function readAll(){try{const v=JSON.parse(localStorage.getItem(NOTES_KEY)||'{}');return v&&typeof v==='object'?v:{}}catch{return {}}}
function writeAll(v){try{localStorage.setItem(NOTES_KEY,JSON.stringify(v))}catch{}}
function noteFor(id){const all=readAll();const n=all[id];return n&&typeof n==='object'?{text:String(n.text||''),quotes:Array.isArray(n.quotes)?n.quotes:[],updated_at:n.updated_at||''}:{text:'',quotes:[],updated_at:''}}
function saveNote(id,note){const all=readAll();all[id]={text:String(note.text||''),quotes:Array.isArray(note.quotes)?note.quotes:[],updated_at:new Date().toISOString()};writeAll(all);window.dispatchEvent(new CustomEvent('velnar-notes-updated',{detail:{id}}))}
function hasNote(id){const n=noteFor(id);return !!(n.text.trim()||n.quotes.length)}
function getThread(){try{return localStorage.getItem(THREAD_KEY)||''}catch{return ''}}
function setThread(v){try{if(v.trim())localStorage.setItem(THREAD_KEY,v.trim());else localStorage.removeItem(THREAD_KEY)}catch{}}
function iconButton(icon,label,cls=''){const b=document.createElement('button');b.type='button';b.className='control velnar-icon-btn '+cls;b.innerHTML=icon;b.setAttribute('aria-label',label);b.title=label;return b}
function fallbackCopy(text){const ta=document.createElement('textarea');ta.value=text;ta.style.cssText='position:fixed;left:-9999px;top:-9999px';document.body.appendChild(ta);ta.select();let ok=false;try{ok=document.execCommand('copy')}catch{}ta.remove();return ok}
async function copyText(text){try{await navigator.clipboard.writeText(text);return true}catch{return fallbackCopy(text)}}
function toast(text){if(typeof showToast==='function')showToast(text)}
function currentArticle(){try{return typeof currentItem!=='undefined'?currentItem:null}catch{return null}}
function sectionNameFromNode(node){const sec=node&&node.closest?node.closest('.section[data-key]'):null;if(!sec)return 'Article';const h=sec.querySelector('h2');return h?h.textContent.trim():(sec.dataset.key||'Article')}

function relabelArticle(){
  const labels={fact:'发生了什么',why_it_matters:'为什么值得我们注意',what_is_new:'真正新增',map_change:'产业地图变化',challenges_existing_assumptions:'它改变了我们什么判断',hype_uncertainty:'我们不应该因此得出什么结论',startup_implications:'对我们意味着什么',prediction:'预测',discussion_question:'值得继续讨论的问题',sources:'来源'};
  document.querySelectorAll('.section[data-key]').forEach(sec=>{const h=sec.querySelector('h2');if(h&&labels[sec.dataset.key])h.textContent=labels[sec.dataset.key]});
  const short={fact:'发生',why_it_matters:'注意',what_is_new:'新增',map_change:'地图',challenges_existing_assumptions:'判断',hype_uncertainty:'边界',startup_implications:'含义',prediction:'预测',discussion_question:'讨论',sources:'来源'};
  document.querySelectorAll('.toc-link[data-key]').forEach(a=>{if(short[a.dataset.key])a.textContent=short[a.dataset.key]});
}

function buildPacket(item,note){
  const bits=[];
  bits.push('[VELNAR Intelligence Radar · Discussion Packet]');
  bits.push('');
  bits.push('文章：'+(item.title||''));
  bits.push('文章 ID：'+(item.id||''));
  if(item.grade)bits.push('等级：'+item.grade);
  if(item.themes&&item.themes.length)bits.push('主题：'+item.themes.join(' · '));
  bits.push('');
  if(item.deck){bits.push('Radar 摘要：');bits.push(item.deck);bits.push('')}
  if(item.why_it_matters){bits.push('为什么值得我们注意：');bits.push(item.why_it_matters);bits.push('')}
  if(item.challenges_existing_assumptions){bits.push('它改变了我们什么判断：');bits.push(item.challenges_existing_assumptions);bits.push('')}
  if(item.hype_uncertainty){bits.push('我们不应该因此得出什么结论：');bits.push(item.hype_uncertainty);bits.push('')}
  if(note.text.trim()){bits.push('我的笔记 / 问题：');bits.push(note.text.trim());bits.push('')}
  if(note.quotes.length){bits.push('我标记的段落：');note.quotes.forEach((q,i)=>{bits.push((i+1)+'. ['+(q.section||'Article')+'] '+q.text)});bits.push('')}
  if(item.discussion_question){bits.push('Radar 建议继续讨论的问题：');bits.push(item.discussion_question);bits.push('')}
  bits.push('请不要把它当成一条孤立新闻。结合我们过去关于 VELNAR、AI 产业控制点、Vertical AI、FDE → Productization、Domain / Enterprise Context、Agent 与真实 Workflow 的讨论，判断：哪些既有认知被强化或削弱？哪些地方我们容易过度反应？对我们当前阶段真正有行动意义的是什么，哪些只应继续观察？');
  return bits.join('\n');
}

function setupArticle(){
  const item=currentArticle();
  if(!item||!item.id)return false;
  relabelArticle();
  const topActions=document.querySelector('.top-actions');
  if(!topActions)return false;
  if(document.getElementById('velnarNoteBtn'))return true;

  let note=noteFor(item.id),saveTimer=null;
  const noteBtn=iconButton(NOTE_ICON,'打开文章笔记');noteBtn.id='velnarNoteBtn';
  const discussBtn=document.createElement('button');discussBtn.type='button';discussBtn.id='velnarDiscussBtn';discussBtn.className='control velnar-discuss-btn';discussBtn.innerHTML=CHAT_ICON+'<span>讨论</span>';discussBtn.setAttribute('aria-label','带着这篇文章去 GPT 讨论');
  const share=document.getElementById('shareBtn');if(share)topActions.insertBefore(noteBtn,share);else topActions.prepend(noteBtn);topActions.insertBefore(discussBtn,document.getElementById('stateBtn')||null);

  const layer=document.createElement('div');layer.className='velnar-notes-layer';layer.id='velnarNotesLayer';layer.setAttribute('aria-hidden','true');layer.innerHTML=`<aside class="velnar-notes-panel" role="dialog" aria-modal="true" aria-label="文章笔记"><div class="velnar-notes-head"><div class="velnar-notes-title"><span class="velnar-panel-icon">${NOTE_ICON}</span><span>我的思考</span></div><button class="velnar-notes-close" type="button" aria-label="关闭笔记">${CLOSE_ICON}</button></div><div class="velnar-notes-body"><div class="velnar-notes-article">当前文章<strong></strong></div><div><textarea class="velnar-note-area" placeholder="记下想带回 GPT 讨论的问题、反对意见、联想或判断……"></textarea><div class="velnar-note-status">仅保存在当前浏览器 · 自动保存</div></div><div><div class="velnar-quote-title">摘录</div><div class="velnar-quotes"></div></div><div class="velnar-discussion-block"><div class="velnar-setting-title">GPT 讨论入口</div><input class="velnar-thread-input" type="url" inputmode="url" placeholder="可选：粘贴这个专用 ChatGPT 对话的 URL"><div class="velnar-thread-hint">配置一次后，“讨论”会复制讨论包并直接打开这个线程；未配置时打开 ChatGPT 首页。</div><button class="velnar-panel-discuss" type="button">带着笔记去讨论</button></div></div></aside>`;
  document.body.appendChild(layer);
  const panel=layer.querySelector('.velnar-notes-panel'),close=layer.querySelector('.velnar-notes-close'),area=layer.querySelector('.velnar-note-area'),quotes=layer.querySelector('.velnar-quotes'),articleTitle=layer.querySelector('.velnar-notes-article strong'),thread=layer.querySelector('.velnar-thread-input'),panelDiscuss=layer.querySelector('.velnar-panel-discuss');
  articleTitle.textContent=item.title||'';thread.value=getThread();
  function refreshButton(){noteBtn.classList.toggle('has-note',hasNote(item.id))}
  function renderQuotes(){note=noteFor(item.id);area.value=note.text;quotes.innerHTML='';if(!note.quotes.length){const e=document.createElement('div');e.className='velnar-empty-quotes';e.textContent='选中文章中的文字后，点出现的小笔记本即可记下。';quotes.appendChild(e)}else note.quotes.forEach((q,i)=>{const row=document.createElement('div');row.className='velnar-quote';const src=document.createElement('span');src.className='velnar-quote-source';src.textContent=q.section||'Article';const txt=document.createElement('span');txt.textContent=q.text;const rm=document.createElement('button');rm.type='button';rm.className='velnar-quote-remove';rm.setAttribute('aria-label','删除摘录');rm.textContent='×';rm.addEventListener('click',()=>{const n=noteFor(item.id);n.quotes.splice(i,1);saveNote(item.id,n);renderQuotes();refreshButton()});row.append(src,txt,rm);quotes.appendChild(row)});refreshButton()}
  function open(){renderQuotes();layer.classList.add('visible');layer.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');setTimeout(()=>area.focus(),30)}
  function hide(){layer.classList.remove('visible');layer.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open')}
  function persistText(){const n=noteFor(item.id);n.text=area.value;saveNote(item.id,n);refreshButton();const status=layer.querySelector('.velnar-note-status');status.textContent='已保存 · 仅在当前浏览器';clearTimeout(saveTimer);saveTimer=setTimeout(()=>status.textContent='仅保存在当前浏览器 · 自动保存',1200)}
  async function discuss(){const n=noteFor(item.id),packet=buildPacket(item,n),url=(getThread()||'https://chatgpt.com/').trim();const opened=window.open(url,'_blank','noopener');const ok=await copyText(packet);toast(ok?'讨论包已复制，粘贴到 GPT 即可继续讨论':'已打开 GPT，请手动复制笔记继续讨论');if(!opened)location.href=url}
  noteBtn.addEventListener('click',open);close.addEventListener('click',hide);layer.addEventListener('click',e=>{if(e.target===layer)hide()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&layer.classList.contains('visible'))hide()});area.addEventListener('input',()=>{clearTimeout(saveTimer);saveTimer=setTimeout(persistText,350)});thread.addEventListener('change',()=>setThread(thread.value));thread.addEventListener('blur',()=>setThread(thread.value));discussBtn.addEventListener('click',discuss);panelDiscuss.addEventListener('click',discuss);
  renderQuotes();refreshButton();

  const selectionBtn=document.createElement('button');selectionBtn.type='button';selectionBtn.className='velnar-selection-note';selectionBtn.innerHTML=NOTE_ICON;selectionBtn.setAttribute('aria-label','记下选中内容');selectionBtn.title='记下';document.body.appendChild(selectionBtn);let selectedText='',selectedSection='';
  function hideSelection(){selectionBtn.classList.remove('visible');selectedText=''}
  function showSelection(){const sel=window.getSelection();if(!sel||sel.isCollapsed){hideSelection();return}const text=sel.toString().trim().replace(/\s+/g,' ');if(text.length<2){hideSelection();return}const node=sel.anchorNode&&sel.anchorNode.parentElement;if(!node||!node.closest('.article')||node.closest('.sources')){hideSelection();return}const range=sel.getRangeAt(0),r=range.getBoundingClientRect();if(!r.width&&!r.height){hideSelection();return}selectedText=text.slice(0,900);selectedSection=sectionNameFromNode(node);const left=Math.min(window.innerWidth-44,Math.max(8,r.right+8));const top=Math.min(window.innerHeight-44,Math.max(8,r.top-38));selectionBtn.style.left=left+'px';selectionBtn.style.top=top+'px';selectionBtn.classList.add('visible')}
  document.addEventListener('mouseup',()=>setTimeout(showSelection,0));document.addEventListener('touchend',()=>setTimeout(showSelection,80),{passive:true});document.addEventListener('scroll',hideSelection,{passive:true});selectionBtn.addEventListener('mousedown',e=>e.preventDefault());selectionBtn.addEventListener('click',()=>{if(!selectedText)return;const n=noteFor(item.id);if(!n.quotes.some(q=>q.text===selectedText))n.quotes.push({text:selectedText,section:selectedSection,created_at:new Date().toISOString()});saveNote(item.id,n);renderQuotes();refreshButton();hideSelection();window.getSelection()?.removeAllRanges();toast('已记下')});
  return true;
}

function setupIndexMarkers(){
  const root=document.getElementById('content');if(!root)return;
  function apply(){document.querySelectorAll('a.item[href*="article.html?id="]').forEach(a=>{let id='';try{id=new URL(a.href,location.href).searchParams.get('id')||''}catch{}const meta=a.querySelector('.meta');if(!meta)return;const old=meta.querySelector('.velnar-note-badge');if(old)old.remove();if(id&&hasNote(id)){const b=document.createElement('span');b.className='velnar-note-badge';b.innerHTML=NOTE_ICON;b.setAttribute('title','这篇文章有本地笔记');b.setAttribute('aria-label','有笔记');meta.appendChild(b)}})}
  const obs=new MutationObserver(()=>apply());const lists=[document.getElementById('unreadList'),document.getElementById('readList')].filter(Boolean);lists.forEach(x=>obs.observe(x,{childList:true,subtree:true}));apply();window.addEventListener('pageshow',apply);window.addEventListener('storage',e=>{if(e.key===NOTES_KEY)apply()});window.addEventListener('velnar-notes-updated',apply);
}

function boot(){injectStyles();if(location.pathname.endsWith('/article.html')){if(!setupArticle()){const root=document.getElementById('articleRoot');if(root){const obs=new MutationObserver(()=>{if(setupArticle())obs.disconnect()});obs.observe(root,{childList:true,subtree:true})}setTimeout(setupArticle,900)}}else setupIndexMarkers()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();