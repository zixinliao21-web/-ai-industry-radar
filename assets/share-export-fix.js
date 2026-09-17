(function(){
  'use strict';

  const shareBtn=document.getElementById('shareImageBtn');
  const saveBtn=document.getElementById('saveImageBtn');
  if(!shareBtn||!saveBtn)return;

  const FONT='-apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang SC","Helvetica Neue",Arial,sans-serif';

  function roundedRect(ctx,x,y,w,h,r){
    const rr=Math.min(r,w/2,h/2);
    ctx.beginPath();
    ctx.moveTo(x+rr,y);
    ctx.arcTo(x+w,y,x+w,y+h,rr);
    ctx.arcTo(x+w,y+h,x,y+h,rr);
    ctx.arcTo(x,y+h,x,y,rr);
    ctx.arcTo(x,y,x+w,y,rr);
    ctx.closePath();
  }

  function wrapText(ctx,text,maxWidth,maxLines){
    const chars=Array.from(String(text||''));
    const lines=[];
    let line='';
    for(const ch of chars){
      const test=line+ch;
      if(line&&ctx.measureText(test).width>maxWidth){
        lines.push(line);
        line=ch;
        if(lines.length===maxLines)break;
      }else{
        line=test;
      }
    }
    if(lines.length<maxLines&&line)lines.push(line);
    const joined=lines.join('');
    if(lines.length===maxLines&&joined.length<chars.join('').length){
      let last=lines[maxLines-1];
      while(last&&ctx.measureText(last+'…').width>maxWidth)last=last.slice(0,-1);
      lines[maxLines-1]=last+'…';
    }
    return lines;
  }

  function loadImage(src){
    return new Promise((resolve,reject)=>{
      const img=new Image();
      img.onload=()=>resolve(img);
      img.onerror=reject;
      img.src=src;
    });
  }

  async function makeQrCanvas(url,size){
    if(!window.QRCode)throw new Error('QR library unavailable');
    const holder=document.createElement('div');
    holder.style.cssText='position:fixed;left:-10000px;top:-10000px;width:'+size+'px;height:'+size+'px;';
    document.body.appendChild(holder);
    try{
      new QRCode(holder,{text:url,width:size,height:size,colorDark:'#111214',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
      const source=holder.querySelector('canvas')||holder.querySelector('img');
      if(!source)throw new Error('QR render failed');
      if(source.tagName==='IMG'&&source.decode)await source.decode().catch(()=>{});
      const out=document.createElement('canvas');
      out.width=size;
      out.height=size;
      const ctx=out.getContext('2d');
      ctx.fillStyle='#fff';
      ctx.fillRect(0,0,size,size);
      ctx.drawImage(source,0,0,size,size);
      return out;
    }finally{
      holder.remove();
    }
  }

  async function buildShareBlob(){
    if(typeof currentItem==='undefined'||!currentItem)throw new Error('Article not ready');
    if(document.fonts&&document.fonts.ready)await document.fonts.ready;

    const SCALE=2;
    const W=1440,H=1080;
    const canvas=document.createElement('canvas');
    canvas.width=W*SCALE;
    canvas.height=H*SCALE;
    const ctx=canvas.getContext('2d');
    ctx.scale(SCALE,SCALE);
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality='high';

    ctx.fillStyle='#fff';
    ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='#dedfe4';
    ctx.lineWidth=1;
    roundedRect(ctx,1,1,W-2,H-2,30);
    ctx.stroke();
    ctx.fillStyle='#080c43';
    ctx.fillRect(0,0,W,5);

    let logo=null;
    try{logo=await loadImage('./assets/velnar-symbol.svg')}catch{}
    if(logo)ctx.drawImage(logo,88,78,58,58);
    ctx.textBaseline='alphabetic';
    ctx.fillStyle='#080c43';
    ctx.font='800 22px '+FONT;
    ctx.fillText('VELNAR',162,104);
    ctx.fillStyle='#8a8c94';
    ctx.font='500 17px '+FONT;
    ctx.fillText('Intelligence Radar',162,131);

    const grade=currentItem.grade||'—';
    const gradeColor=grade==='A'?'#4b4e58':grade==='B'?'#8d9099':'#111214';
    ctx.fillStyle=gradeColor;
    roundedRect(ctx,88,204,54,54,13);
    ctx.fill();
    ctx.fillStyle='#fff';
    ctx.font='800 20px '+FONT;
    ctx.textAlign='center';
    ctx.fillText(grade,115,239);
    ctx.textAlign='left';

    const themes=(currentItem.themes||[]).slice(0,3).join(' · ');
    const meta=[currentItem.date||'',themes].filter(Boolean).join('   ');
    ctx.fillStyle='#777983';
    ctx.font='500 18px '+FONT;
    ctx.fillText(meta,166,238);

    ctx.fillStyle='#111214';
    ctx.font='720 58px '+FONT;
    const titleLines=wrapText(ctx,currentItem.title||'',1160,3);
    let y=330;
    for(const line of titleLines){ctx.fillText(line,88,y);y+=66;}

    y+=22;
    ctx.fillStyle='#5d5f68';
    ctx.font='400 29px '+FONT;
    const deck=String(currentItem.deck||'AI Industry Signals & Strategic Analysis');
    const deckLines=wrapText(ctx,deck,1040,3);
    for(const line of deckLines){ctx.fillText(line,88,y);y+=43;}

    const footerY=830;
    ctx.strokeStyle='#eceef2';
    ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(88,footerY);
    ctx.lineTo(1352,footerY);
    ctx.stroke();

    const url=typeof articleUrl==='function'?articleUrl(currentItem):(location.origin+location.pathname+'?id='+encodeURIComponent(currentItem.id||''));
    let shown=url;
    try{const u=new URL(url);shown=u.host+u.pathname+u.search}catch{}

    ctx.fillStyle='#aaaab2';
    ctx.font='700 13px '+FONT;
    ctx.fillText('OPEN ARTICLE',88,894);
    ctx.fillStyle='#858790';
    ctx.font='500 17px '+FONT;
    const urlLines=wrapText(ctx,shown,780,2);
    let uy=930;
    for(const line of urlLines){ctx.fillText(line,88,uy);uy+=25;}

    const qr=await makeQrCanvas(url,300);
    const qrBox=154;
    const qrX=1186,qrY=860;
    ctx.fillStyle='#fff';
    roundedRect(ctx,qrX,qrY,qrBox,qrBox,16);
    ctx.fill();
    ctx.strokeStyle='#e2e4e9';
    ctx.stroke();
    ctx.drawImage(qr,qrX+10,qrY+10,qrBox-20,qrBox-20);
    ctx.textAlign='right';
    ctx.fillStyle='#8b8d95';
    ctx.font='700 13px '+FONT;
    ctx.fillText('SCAN TO READ',1164,910);
    ctx.font='600 11px '+FONT;
    ctx.fillText('VELNAR · INTELLIGENCE RADAR',1164,934);
    ctx.textAlign='left';

    return await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG export failed')),'image/png',1));
  }

  function saveBlob(blob){
    const a=document.createElement('a');
    const href=URL.createObjectURL(blob);
    a.href=href;
    a.download='VELNAR-Radar-'+((typeof currentItem!=='undefined'&&currentItem&&currentItem.id)||'article')+'.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(href),1500);
  }

  async function withBusy(buttons,task){
    const old=buttons.map(b=>[b,b.disabled,b.textContent]);
    buttons.forEach(b=>b.disabled=true);
    try{return await task()}finally{old.forEach(([b,disabled,text])=>{b.disabled=disabled;b.textContent=text;});}
  }

  async function onSave(event){
    event.preventDefault();
    event.stopImmediatePropagation();
    await withBusy([shareBtn,saveBtn],async()=>{
      saveBtn.textContent='生成中…';
      try{
        saveBlob(await buildShareBlob());
        if(typeof showToast==='function')showToast('高清 Share Card 已保存');
      }catch(err){
        console.error('[VELNAR Share Export]',err);
        if(typeof showToast==='function')showToast('卡片生成失败，请重试');
      }
    });
  }

  async function onShare(event){
    event.preventDefault();
    event.stopImmediatePropagation();
    await withBusy([shareBtn,saveBtn],async()=>{
      shareBtn.textContent='生成中…';
      try{
        const blob=await buildShareBlob();
        const name='VELNAR-Radar-'+((typeof currentItem!=='undefined'&&currentItem&&currentItem.id)||'article')+'.png';
        const file=new File([blob],name,{type:'image/png'});
        if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){
          try{
            await navigator.share({files:[file],title:(currentItem&&currentItem.title)||'VELNAR Intelligence Radar',text:'VELNAR Intelligence Radar'});
            return;
          }catch(err){if(err&&err.name==='AbortError')return;}
        }
        saveBlob(blob);
        if(typeof showToast==='function')showToast('当前浏览器不支持图片直分享，已保存 PNG');
      }catch(err){
        console.error('[VELNAR Share Export]',err);
        if(typeof showToast==='function')showToast('卡片生成失败，请重试');
      }
    });
  }

  shareBtn.addEventListener('click',onShare,true);
  saveBtn.addEventListener('click',onSave,true);
})();
