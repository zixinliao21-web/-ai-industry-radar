(function readerBootstrap(){
  'use strict';
  if(!('speechSynthesis' in window)||typeof SpeechSynthesisUtterance==='undefined')return;

  const synth=window.speechSynthesis;
  const path=location.pathname;
  const type=path.endsWith('/consumer-article.html')?'consumer':path.endsWith('/deep-read-article.html')?'deep':path.endsWith('/article.html')?'industry':null;
  if(!type)return;

  const VOICE_KEY='velnar-reader-voice-v1';
  const RATE_KEY='velnar-reader-rate-v1';
  const PROGRESS_KEY='velnar-reader-progress-v1';
  const MAX_CHARS=230;
  let segments=[],index=0,state='idle',utterance=null,generation=0,voicePool=[],articleKey='',sourceFingerprint='',mounted=false;
  let trigger=null,panel=null,playBtn=null,prevBtn=null,nextBtn=null,statusEl=null,rateSelect=null,voiceSelect=null,stopBtn=null;

  function getItem(){
    try{if(typeof currentItem!=='undefined'&&currentItem)return currentItem}catch{}
    return window.currentItem||null;
  }
  function storageGet(key,fallback){try{const v=localStorage.getItem(key);return v==null?fallback:v}catch{return fallback}}
  function storageSet(key,value){try{localStorage.setItem(key,value);window.dispatchEvent(new CustomEvent('velnar:local-state-changed',{detail:{key:key}}))}catch{}}
  function readProgress(){try{const v=JSON.parse(storageGet(PROGRESS_KEY,'{}'));return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}catch{return{}}}
  function saveProgress(){
    if(!articleKey)return;
    const all=readProgress();
    all[articleKey]={index:index,completed:index>=segments.length,fingerprint:sourceFingerprint,updated_at:new Date().toISOString()};
    const keys=Object.keys(all);
    if(keys.length>120){
      keys.sort((a,b)=>String((all[a]&&all[a].updated_at)||'').localeCompare(String((all[b]&&all[b].updated_at)||'')))
        .slice(0,keys.length-120).forEach(k=>delete all[k]);
    }
    storageSet(PROGRESS_KEY,JSON.stringify(all));
  }
  function simpleHash(value){
    let h=2166136261;const s=String(value||'');
    for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}
    return (h>>>0).toString(36)+'-'+s.length;
  }
  function stripRichTokens(value){
    return String(value||'')
      .replace(/url([^]+)[^]+/g,'$1')
      .replace(/entity\["[^"]*","([^"]+)"[^\]]*\]/g,'$1')
      .replace(/(?:cite|memcite)[^]*/g,'')
      .replace(/[^]*/g,'');
  }
  function cleanInline(value){
    let s=stripRichTokens(String(value||'').split('\\`').join('`'));
    s=s.replace(/!\[([^\]]*)\]\([^)]*\)/g,'$1');
    s=s.replace(/\[([^\]]+)\]\((?:https?:\/\/|\.\/|\/)[^)]*\)/g,'$1');
    s=s.replace(/<[^>]+>/g,' ');
    s=s.replace(/\*\*([^*]+)\*\*/g,'$1').replace(/__([^_]+)__/g,'$1');
    s=s.replace(/~~([^~]+)~~/g,'$1').replace(/`([^`]+)`/g,'$1');
    s=s.replace(/\\([\\`*_[\]{}()#+\-.!>])/g,'$1');
    s=s.replace(/\s+/g,' ').trim();
    return s;
  }
  function tableCells(line){
    let s=String(line||'').trim();
    if(s.startsWith('|'))s=s.slice(1);
    if(s.endsWith('|'))s=s.slice(0,-1);
    return s.split('|').map(x=>cleanInline(x));
  }
  function isTableSeparator(line){
    const cells=tableCells(line);
    return cells.length>0&&cells.every(x=>/^:?-{3,}:?$/.test(x.replace(/\s+/g,'')));
  }
  function codeLineToSpeech(line){
    return cleanInline(String(line||'')
      .replace(/[┌┐└┘├┤┬┴┼│─]+/g,' ')
      .replace(/(?:→|↓|=>|->)+/g,'，然后，')
      .replace(/[✓✔]/g,'已验证')
      .replace(/[✕✖]/g,'未验证')
      .replace(/△/g,'早期验证'));
  }
  function markdownBlocks(markdown){
    const lines=String(markdown||'').replace(/\r\n?/g,'\n').split('\n'),blocks=[];
    let i=0,paragraph=[];
    function flush(){if(!paragraph.length)return;const t=cleanInline(paragraph.join(' '));if(t)blocks.push(t);paragraph=[]}
    while(i<lines.length){
      const raw=lines[i],trim=raw.trim(),normalized=trim.split('\\`').join('`');
      if(normalized.startsWith('```')){
        flush();i++;const code=[];
        while(i<lines.length&&!lines[i].trim().split('\\`').join('`').startsWith('```')){
          const t=codeLineToSpeech(lines[i]);if(t)code.push(t);i++;
        }
        if(i<lines.length)i++;
        if(code.length)blocks.push(code.join('。'));
        continue;
      }
      if(!trim){flush();i++;continue}
      const heading=raw.match(/^\s*#{1,6}\s+(.+)$/);
      if(heading){flush();const t=cleanInline(heading[1]);if(t)blocks.push(t);i++;continue}
      if(i+1<lines.length&&raw.includes('|')&&isTableSeparator(lines[i+1])){
        flush();const headers=tableCells(raw);i+=2;
        while(i<lines.length&&lines[i].trim()&&lines[i].includes('|')){
          const row=tableCells(lines[i]);
          const parts=headers.map((h,j)=>row[j]?((h?h+'，':'')+row[j]):'').filter(Boolean);
          if(parts.length)blocks.push(parts.join('。'));
          i++;
        }
        continue;
      }
      if(/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(raw)){flush();i++;continue}
      if(/^\s*>\s?/.test(raw)){
        flush();const quote=[];
        while(i<lines.length&&/^\s*>\s?/.test(lines[i])){const t=cleanInline(lines[i].replace(/^\s*>\s?/,''));if(t)quote.push(t);i++}
        if(quote.length)blocks.push(quote.join(' '));
        continue;
      }
      const list=raw.match(/^\s*(?:[-*+] |\d+[.)] )(.*)$/);
      if(list){flush();const t=cleanInline(list[1]);if(t)blocks.push(t);i++;continue}
      paragraph.push(raw);i++;
    }
    flush();return blocks;
  }
  function plainBlocks(text){
    return String(text||'').replace(/\r\n?/g,'\n').split(/\n\s*\n+/).map(cleanInline).filter(Boolean);
  }
  function domBlocks(){
    const article=document.querySelector('#articleRoot .article');
    if(!article)return[];
    const canonical=article.querySelector('.article-text,.consumer-markdown-body,.deep-read-body');
    if(canonical)return plainBlocks(canonical.innerText||canonical.textContent||'');
    const blocks=[];
    article.querySelectorAll('.section:not(#sec-sources)').forEach(section=>{
      const h=section.querySelector('h2,h3');
      if(h){const t=cleanInline(h.textContent);if(t)blocks.push(t)}
      const body=section.querySelector('.body,.question-list,.question,.takeaways');
      const t=cleanInline(body?body.textContent:section.textContent);
      if(t)blocks.push(t);
    });
    return blocks;
  }
  function source(){
    const x=getItem()||{};
    if(type==='consumer'&&x.publication_mode==='verbatim'&&typeof x.body_markdown==='string'&&x.body_markdown.trim())return{raw:x.body_markdown,markdown:true,id:x.id};
    if(type==='deep'&&x.content_status==='published_verbatim'&&typeof x.content_markdown==='string'&&x.content_markdown.trim())return{raw:x.content_markdown,markdown:true,id:x.id};
    if(type==='industry'&&typeof x.article_text==='string'&&x.article_text.trim()){
      const title=String(x.title||'').trim(),body=x.article_text.trim();
      return{raw:(title&&!body.startsWith(title)?title+'\n\n':'')+body,markdown:false,id:x.id};
    }
    const blocks=domBlocks();
    return{raw:blocks.join('\n\n'),markdown:false,id:x.id||new URLSearchParams(location.search).get('id')||'article'};
  }
  function splitLong(text){
    const t=String(text||'').trim();if(!t)return[];
    if(t.length<=MAX_CHARS)return[t];
    const sentences=t.match(/[^。！？!?；;]+[。！？!?；;]?/g)||[t],out=[];let buf='';
    function push(part){
      const p=String(part||'').trim();if(!p)return;
      if(!buf){buf=p;return}
      if((buf+p).length<=MAX_CHARS){buf+=p;return}
      out.push(buf);buf=p;
    }
    sentences.forEach(sentence=>{
      const s=sentence.trim();
      if(s.length<=MAX_CHARS){push(s);return}
      const pieces=s.match(/[^，,：:]+[，,：:]?/g)||[s];
      pieces.forEach(piece=>{
        if(piece.length<=MAX_CHARS){push(piece);return}
        if(buf){out.push(buf);buf=''}
        for(let start=0;start<piece.length;start+=MAX_CHARS)out.push(piece.slice(start,start+MAX_CHARS));
      });
    });
    if(buf)out.push(buf);
    return out.filter(Boolean);
  }
  function buildSegments(){
    const src=source(),blocks=src.markdown?markdownBlocks(src.raw):plainBlocks(src.raw);
    segments=blocks.flatMap(splitLong).filter(x=>x.length>1);
    sourceFingerprint=simpleHash(src.raw);
    articleKey=type+':'+String(src.id||'article');
    const saved=readProgress()[articleKey];
    index=saved&&saved.fingerprint===sourceFingerprint?Math.max(0,Math.min(Number(saved.index)||0,segments.length)):0;
    return segments.length>0;
  }
  function currentRate(){
    const n=Number((rateSelect&&rateSelect.value)||storageGet(RATE_KEY,'1'));
    return Number.isFinite(n)?Math.max(.7,Math.min(2,n)):1;
  }
  function refreshVoices(){
    const all=synth.getVoices()||[],zh=all.filter(v=>/^zh(?:-|$)/i.test(v.lang||''));
    voicePool=zh.length?zh:all;
    if(!voiceSelect)return;
    const saved=storageGet(VOICE_KEY,''),previous=voiceSelect.value||saved;
    voiceSelect.innerHTML='';
    if(!voicePool.length){
      const option=document.createElement('option');option.value='';option.textContent='系统默认声音';voiceSelect.appendChild(option);return;
    }
    voicePool.forEach(v=>{const o=document.createElement('option');o.value=v.voiceURI;o.textContent=(v.name||'Voice')+' · '+(v.lang||'');voiceSelect.appendChild(o)});
    const preferred=voicePool.find(v=>v.voiceURI===previous)||voicePool.find(v=>v.default)||voicePool[0];
    voiceSelect.value=(preferred&&preferred.voiceURI)||'';
  }
  function chosenVoice(){
    const uri=(voiceSelect&&voiceSelect.value)||storageGet(VOICE_KEY,'');
    return voicePool.find(v=>v.voiceURI===uri)||voicePool.find(v=>v.default)||voicePool[0]||null;
  }
  function setState(next){state=next;updateUi()}
  function updateUi(message){
    if(!mounted)return;
    const complete=index>=segments.length&&segments.length;
    const pos=complete?segments.length:Math.min(index+1,segments.length);
    statusEl.textContent=message||(complete?'已读完':segments.length?('第 '+pos+' / '+segments.length+' 段'):'没有可朗读正文');
    const active=state==='speaking',paused=state==='paused';
    playBtn.textContent=active?'暂停':paused?'继续':'播放';
    trigger.textContent=active?'⏸ 朗读中':paused?'▶ 继续朗读':'▶ 朗读';
    prevBtn.disabled=!segments.length||index<=0;
    nextBtn.disabled=!segments.length||index>=segments.length-1;
    stopBtn.disabled=state==='idle';
  }
  function speakCurrent(){
    if(!segments.length)return;
    if(index>=segments.length)index=0;
    generation++;const token=generation;
    try{synth.cancel()}catch{}
    utterance=new SpeechSynthesisUtterance(segments[index]);
    const voice=chosenVoice();
    if(voice){utterance.voice=voice;utterance.lang=voice.lang||'zh-CN'}else utterance.lang='zh-CN';
    utterance.rate=currentRate();
    utterance.onend=()=>{
      if(token!==generation)return;
      index++;saveProgress();
      if(index>=segments.length){setState('idle');updateUi('已读完');return}
      setState('speaking');speakCurrent();
    };
    utterance.onerror=e=>{
      if(token!==generation||e.error==='interrupted'||e.error==='canceled')return;
      setState('idle');updateUi('朗读被设备中断，可点击继续');
    };
    setState('speaking');
    try{synth.speak(utterance)}catch{setState('idle');updateUi('当前设备无法启动朗读')}
  }
  function toggle(){
    if(!segments.length)return;
    if(state==='speaking'){try{synth.pause();setState('paused')}catch{};return}
    if(state==='paused'){try{synth.resume();setState('speaking')}catch{speakCurrent()};return}
    speakCurrent();
  }
  function stop(){generation++;try{synth.cancel()}catch{};setState('idle');saveProgress()}
  function move(delta){
    if(!segments.length)return;
    const wasActive=state==='speaking';
    generation++;try{synth.cancel()}catch{}
    index=Math.max(0,Math.min(index+delta,segments.length-1));saveProgress();setState('idle');
    if(wasActive)speakCurrent();
  }
  function mount(){
    if(mounted||!document.querySelector('#articleRoot .article'))return false;
    if(!buildSegments())return false;
    const readingMeta=document.querySelector('#articleRoot .reading-meta');
    const hero=document.querySelector('#articleRoot .hero-block');
    if(!readingMeta||!hero)return false;

    const dot=document.createElement('span');dot.className='dot vr-reader-dot';dot.textContent='·';
    trigger=document.createElement('button');trigger.type='button';trigger.className='vr-reader-trigger';trigger.textContent='▶ 朗读';trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls','velnarReaderPanel');
    readingMeta.append(dot,trigger);

    panel=document.createElement('section');panel.id='velnarReaderPanel';panel.className='vr-reader-panel';panel.hidden=true;panel.setAttribute('aria-label','文章朗读控制');
    panel.innerHTML='<div class="vr-reader-row"><button class="vr-reader-main" type="button" data-reader="play">播放</button><button class="vr-reader-step" type="button" data-reader="prev">上一段</button><span class="vr-reader-status" aria-live="polite"></span><button class="vr-reader-step" type="button" data-reader="next">下一段</button><button class="vr-reader-stop" type="button" data-reader="stop">停止</button></div><div class="vr-reader-settings"><label>语速<select data-reader="rate"><option value="0.9">0.9×</option><option value="1">1.0×</option><option value="1.15">1.15×</option><option value="1.3">1.3×</option><option value="1.5">1.5×</option><option value="2">2.0×</option></select></label><label class="vr-reader-voice-label">声音<select data-reader="voice"></select></label><span class="vr-reader-note">使用当前设备的系统语音 · 免费本地朗读</span></div>';
    hero.insertAdjacentElement('afterend',panel);

    playBtn=panel.querySelector('[data-reader="play"]');
    prevBtn=panel.querySelector('[data-reader="prev"]');
    nextBtn=panel.querySelector('[data-reader="next"]');
    stopBtn=panel.querySelector('[data-reader="stop"]');
    statusEl=panel.querySelector('.vr-reader-status');
    rateSelect=panel.querySelector('[data-reader="rate"]');
    voiceSelect=panel.querySelector('[data-reader="voice"]');

    const savedRate=storageGet(RATE_KEY,'1');
    if(Array.from(rateSelect.options).some(o=>o.value===savedRate))rateSelect.value=savedRate;
    refreshVoices();

    trigger.addEventListener('click',()=>{panel.hidden=false;trigger.setAttribute('aria-expanded','true');toggle()});
    playBtn.addEventListener('click',toggle);
    prevBtn.addEventListener('click',()=>move(-1));
    nextBtn.addEventListener('click',()=>move(1));
    stopBtn.addEventListener('click',stop);
    rateSelect.addEventListener('change',()=>{
      storageSet(RATE_KEY,rateSelect.value);
      const active=state==='speaking';generation++;try{synth.cancel()}catch{};setState('idle');if(active)speakCurrent();
    });
    voiceSelect.addEventListener('change',()=>{
      storageSet(VOICE_KEY,voiceSelect.value);
      const active=state==='speaking';generation++;try{synth.cancel()}catch{};setState('idle');if(active)speakCurrent();
    });
    window.addEventListener('pagehide',()=>{saveProgress();generation++;try{synth.cancel()}catch{}},{once:true});
    mounted=true;updateUi();return true;
  }
  function injectStyle(){
    if(document.getElementById('velnar-reader-style'))return;
    const style=document.createElement('style');style.id='velnar-reader-style';
    style.textContent=[
      '.vr-reader-trigger{appearance:none;border:0;background:transparent;color:var(--text);font:650 10.5px/1 -apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang SC","Helvetica Neue",Arial,sans-serif;padding:3px 0;cursor:pointer}',
      '.vr-reader-trigger:focus-visible,.vr-reader-panel button:focus-visible,.vr-reader-panel select:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(57,110,227,.16),0 0 0 1px rgba(57,110,227,.48);border-radius:8px}',
      '.vr-reader-panel{width:100%;margin-top:18px!important;margin-bottom:2px!important;padding:13px 14px;border:1px solid var(--line);border-radius:14px;background:var(--soft);color:var(--text)}',
      '.vr-reader-panel[hidden]{display:none!important}.vr-reader-row{display:flex;align-items:center;gap:7px}',
      '.vr-reader-panel button,.vr-reader-panel select{font:600 11px/1 -apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang SC","Helvetica Neue",Arial,sans-serif;color:var(--text);background:var(--card);border:1px solid var(--line);border-radius:9px;min-height:34px;padding:7px 10px}',
      '.vr-reader-panel button{cursor:pointer}.vr-reader-panel button:disabled{opacity:.38;cursor:default}.vr-reader-main{min-width:58px}',
      '.vr-reader-status{min-width:74px;text-align:center;font-size:10px;color:var(--muted);font-variant-numeric:tabular-nums}',
      '.vr-reader-settings{display:flex;align-items:center;gap:10px;margin-top:9px;padding-top:9px;border-top:1px solid var(--line);font-size:10px;color:var(--muted)}',
      '.vr-reader-settings label{display:flex;align-items:center;gap:6px}.vr-reader-settings select{max-width:230px;min-height:32px;padding:5px 8px}.vr-reader-note{margin-left:auto;font-size:9px;color:var(--muted)}',
      '@media(hover:hover) and (pointer:fine){.vr-reader-trigger:hover{color:var(--accent)}.vr-reader-panel button:hover:not(:disabled){border-color:var(--line-strong);background:var(--card)}}',
      '@media(max-width:640px){.vr-reader-panel{padding:12px}.vr-reader-row{flex-wrap:wrap}.vr-reader-status{order:5;width:100%;text-align:left;padding-top:2px}.vr-reader-settings{flex-wrap:wrap;align-items:flex-start}.vr-reader-voice-label{width:100%}.vr-reader-voice-label select{flex:1;min-width:0;max-width:none}.vr-reader-note{width:100%;margin-left:0;line-height:1.45}.vr-reader-panel button,.vr-reader-panel select{min-height:38px}}',
      '@media(prefers-reduced-motion:reduce){.vr-reader-trigger,.vr-reader-panel button{transition:none!important}}'
    ].join('');
    document.head.appendChild(style);
  }

  injectStyle();
  try{synth.getVoices()}catch{}
  if('onvoiceschanged' in synth)synth.addEventListener('voiceschanged',refreshVoices);
  if(!mount()){
    let tries=0;
    const timer=setInterval(()=>{tries++;if(mount()||tries>=100)clearInterval(timer)},120);
  }
})();