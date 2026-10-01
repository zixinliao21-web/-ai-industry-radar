#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const fail = [];
const warn = [];

function full(file) { return path.join(root, file); }
function exists(file) { return fs.existsSync(full(file)); }
function readJson(file, required = true) {
  const p = full(file);
  if (!fs.existsSync(p)) {
    if (required) fail.push(`missing: ${file}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    fail.push(`invalid json: ${file}: ${e.message}`);
    return null;
  }
}
function nonEmpty(value) { return typeof value === 'string' && value.trim().length > 0; }
function uniqueKey(set, value, context) {
  if (!nonEmpty(value)) { fail.push(`${context}: missing id`); return false; }
  if (set.has(value)) { fail.push(`duplicate id: ${value}`); return false; }
  set.add(value); return true;
}
function sameArray(a, b) {
  return Array.isArray(a) && Array.isArray(b) && JSON.stringify(a) === JSON.stringify(b);
}

function checkIndustry() {
  const manifest = readJson('news-index.json');
  if (!manifest) return { count: 0, updated_at: null };

  if (manifest.schema_version !== '3.0') fail.push('Industry manifest schema_version must be 3.0');
  if (manifest.storage !== 'segmented_index') fail.push('Industry manifest storage must be segmented_index');
  if (!Number.isInteger(manifest.segment_size) || manifest.segment_size < 1) fail.push('Industry segment_size must be a positive integer');
  if (!Number.isInteger(manifest.item_count) || manifest.item_count < 0) fail.push('Industry item_count must be a non-negative integer');
  if (!Array.isArray(manifest.segments) || manifest.segments.length === 0) {
    fail.push('Industry manifest must contain segments');
    return { count: 0, updated_at: manifest.updated_at || null };
  }

  const ids = new Set();
  const segmentIds = new Set();
  const segmentPaths = new Set();
  let total = 0;

  manifest.segments.forEach((segment, index) => {
    const ctx = `Industry segment descriptor #${index + 1}`;
    if (!segment || typeof segment !== 'object') { fail.push(`${ctx}: invalid descriptor`); return; }
    if (!/^\d{4}$/.test(String(segment.id || ''))) fail.push(`${ctx}: id must be four digits`);
    const expectedPath = `news-index-segments/segment-${segment.id}.json`;
    if (segment.path !== expectedPath) fail.push(`${ctx}: path must be ${expectedPath}`);
    if (segmentIds.has(segment.id)) fail.push(`duplicate Industry segment id: ${segment.id}`);
    if (segmentPaths.has(segment.path)) fail.push(`duplicate Industry segment path: ${segment.path}`);
    segmentIds.add(segment.id); segmentPaths.add(segment.path);

    const data = readJson(segment.path);
    if (!data) return;
    if (data.schema_version !== '3.0') fail.push(`${segment.path}: schema_version must be 3.0`);
    if (String(data.segment) !== String(segment.id)) fail.push(`${segment.path}: segment id mismatch`);
    if (!Array.isArray(data.items)) { fail.push(`${segment.path}: items must be an array`); return; }

    const count = data.items.length;
    total += count;
    if (count !== segment.count) fail.push(`${segment.path}: declared count ${segment.count}, actual ${count}`);
    if (count > manifest.segment_size) fail.push(`${segment.path}: exceeds segment_size ${manifest.segment_size}`);
    if (segment.sealed === true && count !== manifest.segment_size) fail.push(`${segment.path}: sealed segment must contain exactly ${manifest.segment_size} items`);
    if (index < manifest.segments.length - 1 && segment.sealed !== true) fail.push(`${segment.path}: historical segment must be sealed`);
    if (index === manifest.segments.length - 1 && segment.sealed === true && count !== manifest.segment_size) fail.push(`${segment.path}: active sealed segment has invalid count`);

    data.items.forEach((meta, itemIndex) => {
      const itemCtx = `${segment.path} item #${itemIndex + 1}`;
      if (!uniqueKey(ids, meta && meta.id, itemCtx)) return;
      if (!nonEmpty(meta.date)) fail.push(`${itemCtx}: missing date`);
      if (!['S','A','B'].includes(meta.grade)) fail.push(`${itemCtx}: grade must be S/A/B`);
      if (!nonEmpty(meta.title)) fail.push(`${itemCtx}: missing title`);
      if (!Array.isArray(meta.themes)) fail.push(`${itemCtx}: themes must be an array`);

      const itemPath = `news-items/${meta.id}.json`;
      const article = readJson(itemPath);
      if (!article) return;
      if (article.id !== meta.id) fail.push(`${itemPath}: id mismatch`);
      if (article.date !== meta.date) warn.push(`${itemPath}: date differs from index metadata`);
      if (article.grade !== meta.grade) warn.push(`${itemPath}: grade differs from index metadata`);
      if (article.title !== meta.title) warn.push(`${itemPath}: title differs from index metadata`);
      if (Array.isArray(meta.themes) && Array.isArray(article.themes) && !sameArray(article.themes, meta.themes)) {
        warn.push(`${itemPath}: themes differ from index metadata`);
      }
      if (meta.body_format === 'article_text' && !nonEmpty(article.article_text)) {
        fail.push(`${itemPath}: body_format article_text requires non-empty article_text`);
      }
      if (article.sources != null && !Array.isArray(article.sources)) fail.push(`${itemPath}: sources must be an array when present`);
    });
  });

  if (total !== manifest.item_count) fail.push(`Industry item_count mismatch: manifest ${manifest.item_count}, actual ${total}`);

  const itemsDir = full('news-items');
  if (fs.existsSync(itemsDir)) {
    const diskIds = fs.readdirSync(itemsDir).filter(x => x.endsWith('.json')).map(x => x.slice(0, -5));
    const orphans = diskIds.filter(id => !ids.has(id));
    if (orphans.length) warn.push(`Industry orphan item files (not published in index): ${orphans.join(', ')}`);
  }
  const segmentsDir = full('news-index-segments');
  if (fs.existsSync(segmentsDir)) {
    const extra = fs.readdirSync(segmentsDir).filter(x => /^segment-\d{4}\.json$/.test(x))
      .map(x => `news-index-segments/${x}`).filter(p => !segmentPaths.has(p));
    if (extra.length) warn.push(`Unreferenced Industry segment files: ${extra.join(', ')}`);
  }

  return { count: total, updated_at: manifest.updated_at || null };
}

function checkConsumer() {
  const data = readJson('consumer-radar.json');
  if (!data) return { count: 0, updated_at: null };
  if (data.schema_version !== '2.0') fail.push('Consumer schema_version must be 2.0');
  if (!Array.isArray(data.items)) { fail.push('Consumer items must be an array'); return { count: 0, updated_at: data.updated_at || null }; }
  const ids = new Set();
  data.items.forEach((item, i) => {
    const ctx = `Consumer item #${i + 1}`;
    if (!uniqueKey(ids, item && item.id, ctx)) return;
    if (!nonEmpty(item.date)) fail.push(`${ctx}: missing date`);
    if (!nonEmpty(item.title)) fail.push(`${ctx}: missing title`);
    if (item.publication_mode === 'verbatim' && !nonEmpty(item.body_markdown)) fail.push(`Consumer verbatim item missing body_markdown: ${item.id}`);
  });
  return { count: data.items.length, updated_at: data.updated_at || null };
}

function checkDeepRead() {
  const manifest = readJson('deep-read-index.json');
  if (!manifest) return { count: 0, updated_at: null };
  if (manifest.schema_version !== '3.0') fail.push('Deep Read manifest schema_version must be 3.0');
  if (manifest.storage !== 'segmented_index') fail.push('Deep Read manifest storage must be segmented_index');
  if (!Number.isInteger(manifest.segment_size) || manifest.segment_size < 1) fail.push('Deep Read segment_size must be a positive integer');
  if (!Number.isInteger(manifest.item_count) || manifest.item_count < 0) fail.push('Deep Read item_count must be a non-negative integer');
  if (!Array.isArray(manifest.segments) || !manifest.segments.length) {
    fail.push('Deep Read manifest must contain segments');
    return { count: 0, updated_at: manifest.updated_at || null };
  }

  const ids = new Set();
  const segmentPaths = new Set();
  let total = 0;
  manifest.segments.forEach((segment, index) => {
    const ctx = `Deep Read segment descriptor #${index + 1}`;
    if (!segment || typeof segment !== 'object') { fail.push(`${ctx}: invalid descriptor`); return; }
    const expectedPath = `deep-read-index-segments/segment-${segment.id}.json`;
    if (segment.path !== expectedPath) fail.push(`${ctx}: path must be ${expectedPath}`);
    segmentPaths.add(segment.path);
    const data = readJson(segment.path);
    if (!data) return;
    if (data.schema_version !== '3.0') fail.push(`${segment.path}: schema_version must be 3.0`);
    if (String(data.segment) !== String(segment.id)) fail.push(`${segment.path}: segment id mismatch`);
    if (!Array.isArray(data.items)) { fail.push(`${segment.path}: items must be an array`); return; }
    total += data.items.length;
    if (data.items.length !== segment.count) fail.push(`${segment.path}: declared count ${segment.count}, actual ${data.items.length}`);
    if (data.items.length > manifest.segment_size) fail.push(`${segment.path}: exceeds segment_size ${manifest.segment_size}`);
    if (index < manifest.segments.length - 1 && segment.sealed !== true) fail.push(`${segment.path}: historical segment must be sealed`);
    if (segment.sealed === true && data.items.length !== manifest.segment_size) fail.push(`${segment.path}: sealed segment must contain exactly ${manifest.segment_size} items`);

    data.items.forEach((meta, itemIndex) => {
      const itemCtx = `${segment.path} item #${itemIndex + 1}`;
      if (!uniqueKey(ids, meta && meta.id, itemCtx)) return;
      if (!nonEmpty(meta.title)) fail.push(`${itemCtx}: missing title`);
      const itemPath = `deep-read-items/${meta.id}.json`;
      const item = readJson(itemPath);
      if (!item) return;
      if (item.id !== meta.id) fail.push(`${itemPath}: id mismatch`);
      if (item.title !== meta.title) warn.push(`${itemPath}: title differs from index metadata`);
      if (item.content_status === 'published_verbatim' && !nonEmpty(item.content_markdown)) fail.push(`Deep Read published_verbatim item missing content_markdown: ${item.id}`);
    });
  });
  if (total !== manifest.item_count) fail.push(`Deep Read item_count mismatch: manifest ${manifest.item_count}, actual ${total}`);

  const itemsDir = full('deep-read-items');
  if (fs.existsSync(itemsDir)) {
    const diskIds = fs.readdirSync(itemsDir).filter(x => x.endsWith('.json')).map(x => x.slice(0, -5));
    const orphans = diskIds.filter(id => !ids.has(id));
    if (orphans.length) warn.push(`Deep Read orphan item files: ${orphans.join(', ')}`);
  }
  return { count: total, updated_at: manifest.updated_at || null, storage: manifest.storage, segment_count: manifest.segments.length };
}

function checkReleaseLock() {
  const lock = readJson('release-lock.json');
  if (!lock) return;
  if (lock.schema_version !== '1.0') fail.push('release-lock schema_version must be 1.0');
  const allowed = new Set(['idle','preparing','validated','released','failed','reconcile_required']);
  if (!allowed.has(lock.status)) fail.push(`release-lock has unsupported status: ${lock.status}`);
  if (lock.status !== 'idle') fail.push(`release-lock must be idle before production deployment; current status: ${lock.status}`);
}

const summary = {
  industry: checkIndustry(),
  consumer: checkConsumer(),
  deep_read: checkDeepRead()
};
checkReleaseLock();

for (const item of warn) console.warn(`VELNAR publish warning: ${item}`);

if (fail.length) {
  console.error('VELNAR publish validation failed:');
  for (const item of fail) console.error(`- ${item}`);
  process.exit(1);
}

console.log('VELNAR publish validation passed.');
console.log(JSON.stringify(summary));
