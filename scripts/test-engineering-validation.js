'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'validate-publish.js'),'utf8');
const start=source.indexOf('function checkAgentEngineering()'),end=source.indexOf('\nconst summary =',start);
assert(start>=0&&end>start);
const meta={id:'fixture',title:'fixture',grade:'A',topic:'architecture'};
const manifest={schema_version:'1.0',collection:'agent_engineering',storage:'segmented_index',item_count:1,segments:[{id:'0001',path:'engineering-index-segments/segment-0001.json',count:1,sealed:false}]};
const files={'engineering-index.json':manifest,'engineering-index-segments/segment-0001.json':{segment:'0001',items:[meta]},'engineering-items/fixture.json':{...meta,article_text:'in-memory test fixture',sources:[{}],evidence_maturity:'EXPERIMENTAL',quality_score:{total:75,evidence:18}}};
function run(data){const fail=[];const ctx={fail,readJson:(p,required=true)=>{if(!data[p]&&required)fail.push('missing: '+p);return data[p]||null},nonEmpty:v=>typeof v==='string'&&v.trim().length>0};const result=vm.runInNewContext(source.slice(start,end)+'\ncheckAgentEngineering()',ctx);return {fail,result}}
assert.equal(run(files).fail.length,0);assert.equal(run(files).result.count,1);
assert(run({}).fail.includes('missing: engineering-index.json'));
const bad=structuredClone(files);bad['engineering-index.json'].segments[0].id='abcd';assert(run(bad).fail.some(x=>x.includes('invalid segment path')));
const wrong=structuredClone(files);wrong['engineering-index.json'].item_count=2;assert(run(wrong).fail.some(x=>x.includes('count mismatch')));
console.log('Engineering regression: 4 cases passed (in-memory only)');
