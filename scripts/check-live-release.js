#!/usr/bin/env node
'use strict';
const base=(process.env.RADAR_BASE_URL||'https://zixinliao21-web.github.io/-ai-industry-radar/').replace(/\/?$/,'/');
const expectedCommit=process.argv.includes('--commit')?process.argv[process.argv.indexOf('--commit')+1]:null;
const failures=[];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function get(path,kind,attempts){kind=kind||'text';attempts=attempts||5;const url=new URL(path,base).href;let lastError=null;for(let i=0;i<attempts;i++){try{const res=await fetch(url,{cache:'no-store',headers:{'cache-control':'no-cache'}});if(!res.ok)throw new Error('HTTP '+res.status);return kind==='json'?await res.json():await res.text()}catch(e){lastError=e;if(i<attempts-1)await sleep(4000*(i+1))}}failures.push(path+': '+(lastError?lastError.message:'unavailable'));return null}
(async()=>{for(const page of['','article.html','consumer-radar.html','consumer-article.html','deep-read.html','deep-read-article.html']){const html=await get(page,'text');if(html!=null&&!/<html[\s>]/i.test(html))failures.push((page||'/')+': response is not HTML')}
const values=await Promise.all([get('release-status.json','json'),get('news-index.json','json'),get('consumer-radar.json','json'),get('deep-read-index.json','json')]);
const release=values[0],industry=values[1],consumer=values[2],deep=values[3];
if(release){if(release.status!=='healthy'||!release.validation||release.validation.passed!==true)failures.push('release-status.json: production release is not healthy/validated');if(!release.last_release||!release.last_release.commit)failures.push('release-status.json: missing validated commit');if(expectedCommit&&(!release.last_release||release.last_release.commit!==expectedCommit))failures.push('release-status.json: expected commit '+expectedCommit+', live commit '+((release.last_release&&release.last_release.commit)||'missing'))}
if(release&&industry&&release.collections&&release.collections.industry&&release.collections.industry.item_count!==industry.item_count)failures.push('live Industry count mismatch: release '+release.collections.industry.item_count+', manifest '+industry.item_count);
if(release&&consumer&&release.collections&&release.collections.consumer&&release.collections.consumer.item_count!==(consumer.items||[]).length)failures.push('live Consumer count mismatch');
if(release&&deep&&release.collections&&release.collections.deep_read&&release.collections.deep_read.item_count!==deep.item_count)failures.push('live Deep Read count mismatch');
if(failures.length){console.error('VELNAR live-site check failed:');failures.forEach(x=>console.error('- '+x));process.exit(1)}
console.log('VELNAR live-site check passed.');if(release&&release.last_release)console.log('Live validated commit: '+release.last_release.commit)})();
