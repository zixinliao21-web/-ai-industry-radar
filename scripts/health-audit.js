#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
function readJson(file){return JSON.parse(fs.readFileSync(path.join(root,file),'utf8'))}
function arg(name){const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:null}
function parseDate(value){if(!value)return null;const s=String(value).trim();const m=s.match(/^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2})(?:\s*)?([+-]\d{2}:\d{2})?)?/);if(!m)return null;const iso=m[1]+'T'+(m[2]||'00:00')+':00'+(m[3]||'Z');const t=Date.parse(iso);return Number.isFinite(t)?t:null}
function ageDays(value){const t=parseDate(value);if(t==null)return null;return Math.max(0,Math.floor((Date.now()-t)/86400000))}
function row(name,status,count,lastUpdate){return{name,status,item_count:count,last_update:lastUpdate||null,age_days:ageDays(lastUpdate)}}
const industry=readJson('news-index.json');
const consumer=readJson('consumer-radar.json');
const deep=readJson('deep-read.json');
const report={schema_version:'1.0',generated_at:new Date().toISOString(),commit:process.env.GITHUB_SHA||null,status:'healthy',collections:{industry:row('AI Industry Radar','healthy',Number(industry.item_count||0),industry.updated_at),consumer:row('AI Consumer Radar','healthy',Array.isArray(consumer.items)?consumer.items.length:0,consumer.updated_at),deep_read:row('Weekly Deep Read','healthy',Array.isArray(deep.items)?deep.items.length:0,deep.updated_at)}};
const output=arg('--output');
if(output)fs.writeFileSync(path.resolve(root,output),JSON.stringify(report,null,2)+'\n','utf8');
const summaryPath=arg('--summary')||process.env.GITHUB_STEP_SUMMARY;
if(summaryPath){const lines=['# VELNAR Research Health Audit','','Generated: '+report.generated_at,'','| Collection | Structural status | Items | Last content update | Age |','| --- | --- | ---: | --- | ---: |'];for(const item of Object.values(report.collections)){const age=item.age_days==null?'unknown':String(item.age_days)+'d';lines.push('| '+item.name+' | '+item.status+' | '+item.item_count+' | '+(item.last_update||'unknown')+' | '+age+' |')}lines.push('','> Age is informational only. Research cadence remains owned by each research thread; this audit does not invent or enforce publication frequency.','');fs.appendFileSync(summaryPath,lines.join('\n'),'utf8')}
process.stdout.write(JSON.stringify(report,null,2)+'\n');
