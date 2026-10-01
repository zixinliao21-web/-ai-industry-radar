#!/usr/bin/env node
'use strict';
const cp=require('child_process');
const path=require('path');
const root=path.resolve(__dirname,'..');
const args=process.argv.slice(2);
function arg(name){const i=args.indexOf(name);return i>=0?args[i+1]:null}
function validCommit(sha){
  if(!sha)return false;
  const r=cp.spawnSync('git',['cat-file','-e',sha+'^{commit}'],{cwd:root,stdio:'ignore'});
  return r.status===0;
}
async function liveSha(){
  const base=(process.env.RADAR_BASE_URL||'https://zixinliao21-web.github.io/-ai-industry-radar/').replace(/\/?$/,'/');
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),6000);
  try{
    const res=await fetch(new URL('release-status.json?ts='+Date.now(),base),{cache:'no-store',headers:{'cache-control':'no-cache'},signal:controller.signal});
    if(!res.ok)return null;
    const data=await res.json();
    return data&&data.validation&&data.validation.passed===true&&data.last_release?data.last_release.commit:null;
  }catch{return null}finally{clearTimeout(timer)}
}
(async()=>{
  const fallback=arg('--fallback');
  if(!validCommit(fallback)){console.error('Invalid fallback history baseline: '+String(fallback));process.exit(2)}
  const live=await liveSha();
  if(live&&validCommit(live)){
    process.stdout.write(live);
    return;
  }
  process.stderr.write('VELNAR history baseline warning: live validated release unavailable; using fallback '+fallback+'\n');
  process.stdout.write(fallback);
})();
