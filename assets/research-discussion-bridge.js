(function(){
  'use strict';

  const NOTES_KEY='velnar-radar-notes-v1';
  const THREAD_KEY='velnar-radar-discussion-thread-v1';
  const isArticle=!!document.getElementById('articleRoot');
  const isIndex=!!document.getElementById('unreadList');
  let pendingQuote='';
  let saveTimer=null;

  const NOTE_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h8.5A2.5 2.5 0 0 1 18 6v14.5H7A2.5 2.5 0 0 1 4.5 18V6A2.5 2.5 0 0 1 7 3.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8 3.5v17M11 8h4M11 12h4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
  const NOTE_ADD_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h8.5A2.5 2.5 0 0 1 18 6v14.5H7A2.5 2.5 0 0 1 4.5 18V6A2.5 2.5 0 0 1 7 3.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8 3.5v17M11 10h5M13.5 7.5v5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
  const CHAT_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h14v10H9l-4 3v-13Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>';
  const CLOSE_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const TRASH_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8h10M10 5h4M9 8v10m6-10v10M7.5 8l.8 11h7.4l.8-11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function injectStyle(){
    if(document.getElementById('vrb-bridge-style'))return;
    const style=document.createElement('style');
    style.id='vrb-bridge-style';
    style.textContent=`
      .vrb-icon-control{position:relative;width:40px!important;min-width:40px!important;padding:0!important;display:grid!important;place-items:center!important}.vrb-icon-control svg{width:18px;height:18px}.vrb-note-dot{position:absolute;right:5px;top:5px;width:6px;height:6px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 2px var(--bg);display:none}.vrb-icon-control.has-note .vrb-note-dot{display:block}.vrb-discuss{display:flex!important;align-items:center!important;gap:6px!important}.vrb-discuss svg{width:15px;height:15px}
      .vrb-note-layer{position:fixed;inset:0;z-index:1300;pointer-events:none;background:rgba(10,11,15,0);transition:background var(--dur-state,220ms) ease}.vrb-note-layer.open{pointer-events:auto;background:rgba(10,11,15,.24)}.vrb-note-sheet{position:absolute;top:0;right:0;width:min(420px,94vw);height:100dvh;background:var(--card);border-left:1px solid var(--line);box-shadow:-18px 0 60px rgba(17,18,20,.10);transform:translateX(102%);transition:transform var(--dur-state,220ms) var(--ease-velnar,cubic-bezier(.23,1,.32,1));display:flex;flex-direction:column;padding:max(18px,env(safe-area-inset-top)) max(18px,env(safe-area-inset-right)) max(18px,env(safe-area-inset-bottom)) 18px}.vrb-note-layer.open .vrb-note-sheet{transform:translateX(0)}.vrb-note-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding-bottom:14px;border-bottom:1px solid var(--line)}.vrb-note-title{display:flex;align-items:center;gap:9px;font-size:13px;font-weight:760;color:var(--text)}.vrb-note-title svg{width:18px;height:18px}.vrb-note-context{margin-top:5px;font-size:10px;line-height:1.5;color:var(--muted);max-width:310px}.vrb-note-close{width:36px;height:36px;border:1px solid var(--line);border-radius:50%;background:var(--soft);color:var(--text);display:grid;place-items:center;cursor:pointer}.vrb-note-close svg{width:16px;height:16px}.vrb-note-body{flex:1;min-height:0;overflow:auto;padding:16px 1px}.vrb-note-label{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:0 0 8px}.vrb-note-text{width:100%;min-height:190px;resize:vertical;border:1px solid var(--line);border-radius:14px;background:var(--soft);color:var(--text);padding:13px 14px;font:400 14px/1.72 -apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang SC","Helvetica Neue",Arial,sans-serif;outline:none}.vrb-note-text:focus{border-color:var(--line-strong);box-shadow:0 0 0 3px rgba(57,110,227,.10)}.vrb-note-save{margin-top:7px;text-align:right;font-size:9px;color:var(--muted);min-height:14px}.vrb-quotes{display:grid;gap:8px;margin-top:18px}.vrb-quote{position:relative;border-left:2px solid var(--accent);background:var(--soft);border-radius:0 10px 10px 0;padding:10px 36px 10px 12px;color:var(--text);font-size:11.5px;line-height:1.65}.vrb-quote-remove{position:absolute;right:5px;top:5px;width:28px;height:28px;border:0;background:transparent;color:var(--muted);display:grid;place-items:center;cursor:pointer;border-radius:7px}.vrb-quote-remove:hover{background:var(--card);color:var(--text)}.vrb-quote-remove svg{width:14px;height:14px}.vrb-empty-quotes{font-size:11px;color:var(--muted);line-height:1.6;padding:6px 0}.vrb-note-foot{padding-top:12px;border-top:1px solid var(--line)}.vrb-thread-settings{margin-bottom:10px}.vrb-thread-settings summary{cursor:pointer;color:var(--muted);font-size:10px;list-style:none}.vrb-thread-settings summary::-webkit-details-marker{display:none}.vrb-thread-settings summary::before{content:'⚙';margin-right:6px}.vrb-thread-help{font-size:10px;line-height:1.55;color:var(--muted);margin:9px 0 7px}.vrb-thread-row{display:flex;gap:7px}.vrb-thread-input{min-width:0;flex:1;border:1px solid var(--line);border-radius:10px;background:var(--soft);color:var(--text);padding:8px 10px;font-size:10px;outline:none}.vrb-thread-save{border:1px solid var(--line);border-radius:10px;background:var(--soft);color:var(--text);padding:8px 10px;font-size:10px;cursor:pointer}.vrb-discuss-now{width:100%;min-height:44px;border:1px solid var(--text);border-radius:12px;background:var(--text);color:var(--bg);font-weight:700;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px}.vrb-discuss-now svg{width:16px;height:16px}
      .vrb-selection{position:fixed;z-index:1400;display:none}.vrb-selection.show{display:block}.vrb-selection-btn{width:34px;height:34px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--text);box-shadow:0 10px 30px rgba(17,18,20,.16);display:grid;place-items:center;cursor:pointer}.vrb-selection-btn svg{width:17px;height:17px}.vrb-selection-btn:hover{transform:translateY(-1px)}
      .vrb-note-mark{display:inline-flex;align-items:center;color:var(--accent);margin-left:3px;vertical-align:-2px}.vrb-note-mark svg{width:11px;height:11px}.vrb-lens-note{display:inline-flex;align-items:center;gap:6px;margin-top:13px;color:var(--muted);font-size:9.5px;letter-spacing:.02em}.vrb-lens-note::before{content:'';width:14px;height:1px;background:var(--accent);opacity:.75}
      @media(prefers-color-scheme:dark){html:not([data-theme="light"]) .vrb-note-sheet,html:not([data-theme="light"]) .vrb-selection-btn{background:#17191f;color:#edf0f5}html:not([data-theme="light"]) .vrb-note-text,html:not([data-theme="light"]) .vrb-quote,html:not([data-theme="light"]) .vrb-thread-input,html:not([data-theme="light"]) .vrb-thread-save,html:not([data-theme="light"]) .vrb-note-close{background:#1d2027;border-color:#30343d;color:#edf0f5}html:not([data-theme="light"]) .vrb-note-sheet{border-color:#2a2d35;box-shadow:-18px 0 60px rgba(0,0,0,.35)}html:not([data-theme="light"]) .vrb-discuss-now{background:#f1f3f6;color:#111318;border-color:#f1f3f6}}
      html[data-theme="dark"] .vrb-note-sheet,html[data-theme="dark"] .vrb-selection-btn{background:#17191f;color:#edf0f5}html[data-theme="dark"] .vrb-note-text,html[data-theme="dark"] .vrb-quote,html[data-theme="dark"] .vrb-thread-input,html[data-theme="dark"] .vrb-thread-save,html[data-theme="dark"] .vrb-note-close{background:#1d2027;border-color:#30343d;color:#edf0f5}html[data-theme="dark"] .vrb-note-sheet{border-color:#2a2d35;box-shadow:-18px 0 60px rgba(0,0,0,.35)}html[data-theme="dark"] .vrb-discuss-now{background:#f1f3f6;color:#111318;border-color:#f1f3f6}
      @media(max-width:640px){.vrb-note-sheet{width:100vw;border-left:0}.vrb-discuss{padding-left:10px!important;padding-right:10px!important}.vrb-discuss span{display:none}.vrb-discuss svg{width:17px;height:17px}}
      @media(prefers-reduced-motion:reduce){.vrb-note-layer,.vrb-note-sheet,.vrb-selection-btn{transition:none!important;transform:none!important}.vrb-note-layer:not(.open) .vrb-note-sheet{display:none}}
    `;
    document.head.appendChild(style);
  }

  function readNotes(){
    try{const data=JSON.parse(localStorage.getItem(NOTES_KEY)||'{}');return data&&typeof data==='object'&&!Array.isArray(data)?data:{}}catch{return{}}
  }
  function writeNotes(data){try{localStorage.setItem(NOTES_KEY,JSON.stringify(data))}catch{}}
  function articleId(){
    try{if(typeof currentItem!=='undefined'&&currentItem&&currentItem.id)return currentItem.id}catch{}
    return new URLSearchParams(location.search).get('id')||'';
  }
  function current(){try{return typeof currentItem!=='undefined'?currentItem:null}catch{return null}}
  function emptyEntry(){return{text:'',quotes:[],updated_at:''}}
  function getEntry(id=articleId()){
    const all=readNotes(),raw=all[id]||{};
    return{text:String(raw.text||''),quotes:Array.isArray(raw.quotes)?raw.quotes.filter(Boolean).map(String):[],updated_at:String(raw.updated_at||'')};
  }
  function saveEntry(entry,id=articleId()){
    if(!id)return;
    const all=readNotes();
    const clean={text:String(entry.text||''),quotes:Array.isArray(entry.quotes)?entry.quotes.filter(Boolean).map(String).slice(0,50):[],updated_at:new Date().toISOString()};
    if(!clean.text.trim()&&!clean.quotes.length)delete all[id];else all[id]=clean;
    writeNotes(all);
    updateNoteState();
    updateIndexMarks();
  }
  function hasNote(id){const e=getEntry(id);return !!(e.text.trim()||e.quotes.length)}
  function showToastSafe(text){try{if(typeof showToast==='function'){showToast(text);return}}catch{}console.info('[VELNAR Radar]',text)}
  async function copyText(text){
    try{await navigator.clipboard.writeText(text);return true}catch{}
    const ta=document.createElement('textarea');ta.value=text;ta.style.cssText='position:fixed;left:-9999px;top:-9999px';document.body.appendChild(ta);ta.select();let ok=false;try{ok=document.execCommand('copy')}catch{}ta.remove();return ok;
  }

  function applyStrategicLabels(){
    if(!isArticle)return;
    const root=document.getElementById('articleRoot');
    if(!root||!root.querySelector('.article'))return;
    const labels={
      fact:'发生了什么',
      why_it_matters:'为什么值得我们注意',
      what_is_new:'真正新增了什么',
      map_change:'产业地图上哪里变了',
      challenges_existing_assumptions:'它改变了我们什么判断',
      hype_uncertainty:'我们不应该因此得出什么结论',
      startup_implications:'对我们行动路径的含义',
      prediction:'接下来观察什么',
      discussion_question:'值得继续讨论的问题',
      sources:'Sources｜来源'
    };
    Object.entries(labels).forEach(([key,label])=>{
      const h=document.querySelector('#sec-'+key+' h2');if(h&&h.textContent!==label)h.textContent=label;
    });
    const tocLabels={fact:'Signal',why_it_matters:'Why us',what_is_new:'Delta',map_change:'Map',challenges_existing_assumptions:'Our view',hype_uncertainty:'Guardrail',startup_implications:'Action',prediction:'Watch',discussion_question:'Discuss',sources:'Sources'};
    document.querySelectorAll('.toc-link[data-key]').forEach(a=>{const label=tocLabels[a.dataset.key];if(label&&a.textContent!==label)a.textContent=label});
    const hero=document.querySelector('.reading-meta');
    if(hero&&!document.querySelector('.vrb-lens-note')){const n=document.createElement('div');n.className='vrb-lens-note';n.textContent='战略观察 · 重点看它对我们既有判断的增量';hero.insertAdjacentElement('afterend',n)}
  }

  function mountIndexMarks(){
    if(!isIndex)return;
    document.querySelectorAll('a.item[href*="article.html?id="]').forEach(a=>{
      let id='';try{id=new URL(a.href,location.href).searchParams.get('id')||''}catch{}
      const meta=a.querySelector('.meta');if(!meta)return;
      let mark=meta.querySelector('.vrb-note-mark');
      if(hasNote(id)){
        if(!mark){mark=document.createElement('span');mark.className='vrb-note-mark';mark.setAttribute('title','这篇文章有阅读笔记');mark.setAttribute('aria-label','有阅读笔记');mark.innerHTML=NOTE_ICON;meta.appendChild(mark)}
      }else if(mark)mark.remove();
    });
  }
  function updateIndexMarks(){mountIndexMarks()}

  function mountArticleBridge(){
    if(!isArticle)return;
    const actions=document.querySelector('.top-actions');
    if(!actions||document.getElementById('vrbNoteBtn'))return;

    const noteBtn=document.createElement('button');
    noteBtn.id='vrbNoteBtn';noteBtn.type='button';noteBtn.className='control vrb-icon-control';noteBtn.setAttribute('aria-label','阅读笔记');noteBtn.setAttribute('title','阅读笔记');noteBtn.innerHTML=NOTE_ICON+'<span class="vrb-note-dot" aria-hidden="true"></span>';
    const discussBtn=document.createElement('button');
    discussBtn.id='vrbDiscussBtn';discussBtn.type='button';discussBtn.className='control vrb-discuss';discussBtn.setAttribute('aria-label','带着这篇文章回 GPT 讨论');discussBtn.innerHTML=CHAT_ICON+'<span>讨论</span>';
    actions.insertBefore(noteBtn,actions.firstChild);actions.insertBefore(discussBtn,noteBtn.nextSibling);

    const layer=document.createElement('div');
    layer.id='vrbNoteLayer';layer.className='vrb-note-layer';layer.setAttribute('aria-hidden','true');
    layer.innerHTML='<aside class="vrb-note-sheet" role="dialog" aria-modal="true" aria-labelledby="vrbNoteTitle"><div class="vrb-note-head"><div><div class="vrb-note-title" id="vrbNoteTitle">'+NOTE_ICON+'<span>阅读笔记</span></div><div class="vrb-note-context" id="vrbNoteContext"></div></div><button class="vrb-note-close" id="vrbNoteClose" type="button" aria-label="关闭阅读笔记">'+CLOSE_ICON+'</button></div><div class="vrb-note-body"><div class="vrb-note-label">我的问题与判断</div><textarea class="vrb-note-text" id="vrbNoteText" placeholder="记下你想回到 GPT 继续讨论的问题、不同意的地方，或与 VELNAR 当前路径有关的判断。"></textarea><div class="vrb-note-save" id="vrbNoteSaveState"></div><div class="vrb-quotes" id="vrbQuoteList"></div></div><div class="vrb-note-foot"><details class="vrb-thread-settings"><summary>讨论入口设置</summary><div class="vrb-thread-help">可选：粘贴这个产业研究专用 GPT 聊天的链接。只保存在当前浏览器。</div><div class="vrb-thread-row"><input class="vrb-thread-input" id="vrbThreadInput" type="url" inputmode="url" placeholder="https://chatgpt.com/c/…"><button class="vrb-thread-save" id="vrbThreadSave" type="button">保存</button></div></details><button class="vrb-discuss-now" id="vrbDiscussNow" type="button">'+CHAT_ICON+'<span>带着笔记去讨论</span></button></div></aside>';
    document.body.appendChild(layer);

    const selection=document.createElement('div');selection.id='vrbSelection';selection.className='vrb-selection';selection.innerHTML='<button class="vrb-selection-btn" id="vrbSelectionBtn" type="button" aria-label="记下选中内容" title="记下">'+NOTE_ADD_ICON+'</button>';document.body.appendChild(selection);

    const noteText=document.getElementById('vrbNoteText');
    const noteSave=document.getElementById('vrbNoteSaveState');
    const threadInput=document.getElementById('vrbThreadInput');

    function renderPanel(){
      const e=getEntry();const item=current();
      noteText.value=e.text;
      document.getElementById('vrbNoteContext').textContent=item?item.title:(articleId()||'当前文章');
      try{threadInput.value=localStorage.getItem(THREAD_KEY)||''}catch{threadInput.value=''}
      renderQuotes(e);
      updateNoteState();
    }
    function renderQuotes(entry){
      const list=document.getElementById('vrbQuoteList');
      if(!entry.quotes.length){list.innerHTML='<div class="vrb-note-label">摘录</div><div class="vrb-empty-quotes">选中文章中的文字后，点出现的小笔记本图标即可记下。</div>';return}
      list.innerHTML='<div class="vrb-note-label">摘录 · '+entry.quotes.length+'</div>'+entry.quotes.map((q,i)=>'<div class="vrb-quote"><span>'+escapeHtml(q)+'</span><button class="vrb-quote-remove" type="button" data-index="'+i+'" aria-label="删除这条摘录">'+TRASH_ICON+'</button></div>').join('');
      list.querySelectorAll('.vrb-quote-remove').forEach(btn=>btn.addEventListener('click',()=>{const e=getEntry();e.quotes.splice(Number(btn.dataset.index),1);saveEntry(e);renderQuotes(getEntry());showToastSafe('摘录已删除')}));
    }
    function openPanel(){renderPanel();layer.classList.add('open');layer.setAttribute('aria-hidden','false');setTimeout(()=>noteText.focus(),80)}
    function closePanel(){layer.classList.remove('open');layer.setAttribute('aria-hidden','true')}

    noteBtn.addEventListener('click',openPanel);
    document.getElementById('vrbNoteClose').addEventListener('click',closePanel);
    layer.addEventListener('click',e=>{if(e.target===layer)closePanel()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&layer.classList.contains('open'))closePanel()});
    noteText.addEventListener('input',()=>{noteSave.textContent='正在保存…';clearTimeout(saveTimer);saveTimer=setTimeout(()=>{const e=getEntry();e.text=noteText.value;saveEntry(e);noteSave.textContent='已保存在此浏览器';setTimeout(()=>{if(noteSave.textContent==='已保存在此浏览器')noteSave.textContent=''},1100)},320)});
    document.getElementById('vrbThreadSave').addEventListener('click',()=>{const v=threadInput.value.trim();if(v&&!/^https?:\/\//i.test(v)){showToastSafe('请输入完整的 http(s) 链接');return}try{if(v)localStorage.setItem(THREAD_KEY,v);else localStorage.removeItem(THREAD_KEY)}catch{}showToastSafe(v?'讨论线程已保存':'已清除固定讨论线程')});

    async function discuss(){
      const packet=buildDiscussionPacket();const copied=await copyText(packet);if(copied)showToastSafe('讨论包已复制');
      let target='';try{target=(localStorage.getItem(THREAD_KEY)||'').trim()}catch{}
      const url=/^https?:\/\//i.test(target)?target:'https://chatgpt.com/';
      window.open(url,'_blank','noopener');
      if(!target)setTimeout(()=>showToastSafe('讨论包已复制；可在笔记设置中绑定固定 GPT 线程'),250);
    }
    discussBtn.addEventListener('click',discuss);document.getElementById('vrbDiscussNow').addEventListener('click',discuss);

    function captureSelection(){
      setTimeout(()=>{
        const sel=window.getSelection();
        if(!sel||sel.isCollapsed){hideSelection();return}
        const text=String(sel.toString()||'').replace(/\s+/g,' ').trim();
        if(text.length<4){hideSelection();return}
        let node=sel.anchorNode;node=node&&node.nodeType===3?node.parentElement:node;
        if(!node||!node.closest||!node.closest('.article')){hideSelection();return}
        let rect;try{rect=sel.getRangeAt(0).getBoundingClientRect()}catch{hideSelection();return}
        if(!rect||(!rect.width&&!rect.height)){hideSelection();return}
        pendingQuote=text.slice(0,900);
        selection.style.left=Math.max(8,Math.min(window.innerWidth-42,rect.right-30))+'px';
        selection.style.top=Math.max(8,Math.min(window.innerHeight-42,rect.bottom+7))+'px';
        selection.classList.add('show');
      },20);
    }
    function hideSelection(){selection.classList.remove('show');pendingQuote=''}
    document.addEventListener('mouseup',captureSelection);document.addEventListener('keyup',e=>{if(e.key==='Shift'||e.key.startsWith('Arrow'))captureSelection()});document.addEventListener('selectionchange',()=>{if(window.matchMedia('(pointer:coarse)').matches)captureSelection()});window.addEventListener('scroll',hideSelection,{passive:true});
    document.getElementById('vrbSelectionBtn').addEventListener('pointerdown',e=>e.preventDefault());
    document.getElementById('vrbSelectionBtn').addEventListener('click',()=>{if(!pendingQuote)return;const e=getEntry();if(!e.quotes.includes(pendingQuote))e.quotes.push(pendingQuote);saveEntry(e);showToastSafe('已记下');selection.classList.remove('show');window.getSelection()?.removeAllRanges();pendingQuote='';});

    const root=document.getElementById('articleRoot');
    if(root&&root.querySelector('.article'))applyStrategicLabels();
    updateNoteState();
  }

  function buildDiscussionPacket(){
    const item=current()||{};const note=getEntry();
    const quotes=note.quotes.length?note.quotes.map((q,i)=>(i+1)+'. “'+q+'”').join('\n'):'（无）';
    const personal=note.text.trim()||'（暂无额外笔记）';
    if(typeof item.article_text==='string'&&item.article_text.trim()){
      return '[VELNAR Intelligence Radar]\n\n文章：'+(item.title||document.title)+'\n文章 ID：'+(item.id||articleId())+'\n日期：'+(item.date||'')+'\n\n完整研究正文：\n'+item.article_text+'\n\n我的笔记：\n'+personal+'\n\n我记下的原文：\n'+quotes+'\n\n请基于这篇完整研究正文继续分析。指出相对我们既有判断真正新增了什么，再讨论它对 VELNAR 当前阶段意味着什么；不要因为单一产业信号扩大当前工程范围，区分“现在应行动”“继续观察”“暂时无关”。';
    }
    const core=item.why_it_matters||item.deck||'';
    const changed=item.challenges_existing_assumptions||item.map_change||item.startup_implications||'';
    const guard=item.hype_uncertainty||'';
    return '[VELNAR Intelligence Radar]\n\n文章：'+(item.title||document.title)+'\n文章 ID：'+(item.id||articleId())+'\n日期：'+(item.date||'')+'\n\n为什么值得我们注意：\n'+core+'\n\n它对既有判断的增量：\n'+changed+'\n\n防止误判：\n'+guard+'\n\n我的笔记：\n'+personal+'\n\n我记下的原文：\n'+quotes+'\n\n请结合我们此前关于 VELNAR、AI 产业地图、Vertical AI、FDE → Product → Network、Enterprise Context / Ontology、Agent Control Plane 等讨论继续分析。先指出这条信号相对我们既有判断真正新增了什么，再讨论它对 VELNAR 当前阶段意味着什么。不要因为单一产业信号就扩大当前工程范围；区分“现在应行动”“继续观察”“暂时无关”。';
  }

  function updateNoteState(){
    const btn=document.getElementById('vrbNoteBtn');if(btn)btn.classList.toggle('has-note',hasNote(articleId()));
  }
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

  injectStyle();
  if(isArticle){mountArticleBridge();const retry=setInterval(()=>{mountArticleBridge();applyStrategicLabels();if(document.querySelector('.article'))clearInterval(retry)},250);setTimeout(()=>clearInterval(retry),10000)}
  if(isIndex){mountIndexMarks();const lists=[document.getElementById('unreadList'),document.getElementById('readList')].filter(Boolean);const mo=new MutationObserver(mountIndexMarks);lists.forEach(x=>mo.observe(x,{childList:true,subtree:true}));window.addEventListener('pageshow',mountIndexMarks)}
  window.addEventListener('storage',e=>{if(e.key===NOTES_KEY){updateNoteState();mountIndexMarks()}});
})();