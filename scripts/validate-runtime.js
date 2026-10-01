#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const fail = [];

const htmlFiles = [
  'index.html','article.html','consumer-radar.html','consumer-article.html','deep-read.html','deep-read-article.html'
];
const jsFiles = [
  'assets/radar-runtime.js','assets/state-sync.js','assets/continue-reading.js',
  'assets/article-reader.js','assets/article-completion.js',
  'assets/research-discussion-bridge.js','assets/collection-discussion-bridge.js',
  'assets/share-export-fix.js','service-worker.js'
];

function read(file) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) { fail.push(`missing runtime file: ${file}`); return ''; }
  return fs.readFileSync(p, 'utf8');
}
function checkSyntax(code, file, suffix='') {
  if (!code.trim()) return;
  try { new Function(code); }
  catch (e) { fail.push(`${file}${suffix}: JavaScript syntax error: ${e.message}`); }
}

for (const file of jsFiles) checkSyntax(read(file), file);

for (const file of htmlFiles) {
  const html = read(file);
  const regex = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let match, n = 0;
  while ((match = regex.exec(html))) {
    n += 1;
    checkSyntax(match[1], file, ` inline script #${n}`);
  }
}

const requiredRefs = {
  'index.html':['assets/radar-runtime.js','assets/state-sync.js','assets/continue-reading.js'],
  'consumer-radar.html':['assets/radar-runtime.js','assets/state-sync.js','assets/continue-reading.js'],
  'deep-read.html':['assets/radar-runtime.js','assets/state-sync.js','assets/continue-reading.js'],
  'article.html':['assets/radar-runtime.js','assets/state-sync.js','assets/article-reader.js','assets/article-completion.js'],
  'consumer-article.html':['assets/radar-runtime.js','assets/state-sync.js','assets/article-reader.js','assets/article-completion.js'],
  'deep-read-article.html':['assets/radar-runtime.js','assets/state-sync.js','assets/article-reader.js','assets/article-completion.js']
};
for (const [file, refs] of Object.entries(requiredRefs)) {
  const html = read(file);
  for (const ref of refs) if (!html.includes(ref)) fail.push(`${file}: missing required runtime reference ${ref}`);
}

const sw = read('service-worker.js');
for (const route of ['article.html','consumer-radar.html','consumer-article.html','deep-read.html','deep-read-article.html']) {
  if (!sw.includes(route)) fail.push(`service-worker.js: missing route/fallback reference ${route}`);
}
for (const store of ['news-index.json','consumer-radar.json','deep-read-index.json','news-index-segments','deep-read-index-segments','deep-read-items']) {
  if (!sw.includes(store)) fail.push(`service-worker.js: missing network-first content reference ${store}`);
}

try { JSON.parse(read('manifest.webmanifest')); }
catch (e) { fail.push(`manifest.webmanifest: invalid JSON: ${e.message}`); }

if (fail.length) {
  console.error('VELNAR runtime validation failed:');
  for (const item of fail) console.error(`- ${item}`);
  process.exit(1);
}
console.log('VELNAR runtime validation passed.');
