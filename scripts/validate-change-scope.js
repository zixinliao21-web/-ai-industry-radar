#!/usr/bin/env node
'use strict';
const cp=require('child_process');
const path=require('path');
const root=path.resolve(__dirname,'..');
const fail=[];
const args=process.argv.slice(2);
function arg(name){const i=args.indexOf(name);return i>=0?args[i+1]:null}
const base=arg('--base')||process.env.CHANGE_BASE;
if(!base){console.error('VELNAR change-scope validation requires --base <sha> or CHANGE_BASE');process.exit(2)}
const verify=cp.spawnSync('git',['cat-file','-e',base+'^{commit}'],{cwd:root,stdio:'ignore'});
if(verify.status!==0){console.error('Invalid change-scope base: '+base);process.exit(2)}
const diff=cp.spawnSync('git',['diff','--name-only',base+'..HEAD'],{cwd:root,encoding:'utf8'});
if(diff.status!==0){console.error(diff.stderr||'git diff failed');process.exit(2)}
const files=diff.stdout.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);

const frozen=new Set(['news.json','deep-read.json']);
for(const file of files)if(frozen.has(file))fail.push('frozen legacy store changed: '+file);

function collection(file){
  if(file==='news-index.json'||file.startsWith('news-index-segments/')||file.startsWith('news-items/'))return'industry';
  if(file==='consumer-radar.json')return'consumer';
  if(file==='deep-read-index.json'||file.startsWith('deep-read-index-segments/')||file.startsWith('deep-read-items/'))return'deep_read';
  return null;
}
const contentChanges=files.map(file=>({file,collection:collection(file)})).filter(x=>x.collection);
const collections=[...new Set(contentChanges.map(x=>x.collection))];
if(collections.length>1)fail.push('one candidate modified multiple canonical collections: '+collections.join(', '));

const runtimePatterns=[
  file=>file.endsWith('.html'),
  file=>file.startsWith('assets/'),
  file=>file==='service-worker.js',
  file=>file==='manifest.webmanifest',
  file=>file.startsWith('.github/workflows/'),
  file=>file.startsWith('scripts/'),
  file=>file==='release-lock.json',
  file=>file==='release-status.json'
];
if(contentChanges.length){
  const runtime=files.filter(file=>runtimePatterns.some(test=>test(file)));
  if(runtime.length)fail.push('content candidate also modified runtime/release infrastructure: '+runtime.join(', '));
}

if(fail.length){
  console.error('VELNAR change-scope validation failed:');
  fail.forEach(x=>console.error('- '+x));
  process.exit(1);
}
console.log('VELNAR change-scope validation passed against '+base+'.');
if(collections.length)console.log('Canonical collection changed: '+collections[0]);
else console.log('No canonical collection content changed.');
