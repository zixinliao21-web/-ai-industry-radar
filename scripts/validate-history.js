#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const cp=require('child_process');
const root=path.resolve(__dirname,'..');
const fail=[];

function arg(name){const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:null}
function currentJson(file){return JSON.parse(fs.readFileSync(path.join(root,file),'utf8'))}
function gitShow(base,file,required=true){
  const r=cp.spawnSync('git',['show',base+':'+file],{cwd:root,encoding:'utf8'});
  if(r.status!==0){if(required)fail.push('historical baseline missing '+file+' at '+base);return null}
  return r.stdout;
}
function oldJson(base,file,required=true){
  const raw=gitShow(base,file,required);if(raw==null)return null;
  try{return JSON.parse(raw)}catch(e){fail.push('historical JSON invalid '+file+': '+e.message);return null}
}
function byId(items){const m=new Map();for(const x of items||[])if(x&&x.id)m.set(String(x.id),x);return m}
function loadSegmentItems(base,manifest){
  const out=[];
  for(const s of manifest.segments||[]){
    const j=base?oldJson(base,s.path):currentJson(s.path);
    if(j&&Array.isArray(j.items))out.push(...j.items);
  }
  return out;
}

function checkSegmented(base,cfg){
  const prev=oldJson(base,cfg.manifest);if(!prev)return;
  const cur=currentJson(cfg.manifest);
  if(Number(cur.item_count)<Number(prev.item_count))fail.push(cfg.name+': item_count decreased from '+prev.item_count+' to '+cur.item_count);
  const curDesc=new Map((cur.segments||[]).map(x=>[String(x.id),x]));
  for(const ps of prev.segments||[]){
    const cs=curDesc.get(String(ps.id));
    if(!cs){fail.push(cfg.name+': historical segment descriptor removed: '+ps.id);continue}
    if(ps.sealed===true){
      if(cs.path!==ps.path||cs.count!==ps.count||cs.sealed!==true)fail.push(cfg.name+': sealed segment descriptor changed: '+ps.id);
      const oldRaw=gitShow(base,ps.path);
      const curPath=path.join(root,ps.path);
      if(!fs.existsSync(curPath))fail.push(cfg.name+': sealed segment file missing: '+ps.path);
      else if(oldRaw!=null&&fs.readFileSync(curPath,'utf8')!==oldRaw)fail.push(cfg.name+': sealed segment content changed: '+ps.path);
    }else{
      const po=oldJson(base,ps.path),co=currentJson(ps.path);
      const oldItems=po&&Array.isArray(po.items)?po.items:[];
      const newItems=co&&Array.isArray(co.items)?co.items:[];
      if(newItems.length<oldItems.length)fail.push(cfg.name+': active segment lost historical items: '+ps.path);
      for(let i=0;i<oldItems.length;i++){
        if(!newItems[i]||String(newItems[i].id)!==String(oldItems[i].id)){
          fail.push(cfg.name+': active segment is not append-only at '+ps.path+' position '+(i+1));break;
        }
      }
    }
  }
  const prevItems=loadSegmentItems(base,prev);
  const curItems=loadSegmentItems(null,cur);
  const curMeta=byId(curItems);
  for(const oldMeta of prevItems){
    if(!curMeta.has(String(oldMeta.id)))fail.push(cfg.name+': historical indexed id disappeared: '+oldMeta.id);
    const itemPath=cfg.itemDir+'/'+oldMeta.id+'.json';
    const oldItem=oldJson(base,itemPath);
    const curPath=path.join(root,itemPath);
    if(!oldItem||!fs.existsSync(curPath)){fail.push(cfg.name+': historical canonical item missing: '+oldMeta.id);continue}
    let curItem=null;try{curItem=JSON.parse(fs.readFileSync(curPath,'utf8'))}catch(e){continue}
    const oldBody=oldItem[cfg.bodyField],newBody=curItem[cfg.bodyField];
    if(typeof oldBody==='string'&&oldBody.length&&newBody!==oldBody)fail.push(cfg.name+': canonical historical body changed for '+oldMeta.id);
  }
}

function checkConsumer(base){
  const prev=oldJson(base,'consumer-radar.json');if(!prev)return;
  const cur=currentJson('consumer-radar.json');
  const oldItems=Array.isArray(prev.items)?prev.items:[];
  const newItems=Array.isArray(cur.items)?cur.items:[];
  if(newItems.length<oldItems.length)fail.push('Consumer: item count decreased from '+oldItems.length+' to '+newItems.length);
  const now=byId(newItems);
  for(const old of oldItems){
    const current=now.get(String(old.id));
    if(!current){fail.push('Consumer: historical id disappeared: '+old.id);continue}
    if(old.publication_mode==='verbatim'&&typeof old.body_markdown==='string'&&old.body_markdown.length&&current.body_markdown!==old.body_markdown){
      fail.push('Consumer: canonical historical body_markdown changed for '+old.id);
    }
  }
}

const base=arg('--base')||process.env.BASE_SHA;
if(!base){console.error('VELNAR history validation requires --base <sha> or BASE_SHA');process.exit(2)}
checkSegmented(base,{name:'Industry',manifest:'news-index.json',itemDir:'news-items',bodyField:'article_text'});
checkConsumer(base);
checkSegmented(base,{name:'Deep Read',manifest:'deep-read-index.json',itemDir:'deep-read-items',bodyField:'content_markdown'});
if(fail.length){console.error('VELNAR publication history validation failed:');fail.forEach(x=>console.error('- '+x));process.exit(1)}
console.log('VELNAR publication history validation passed against '+base+'.');
