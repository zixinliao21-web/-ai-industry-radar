#!/usr/bin/env node

/**
 * VELNAR Research publishing safety validator.
 *
 * Phase 1: read-only validation.
 * This script intentionally does not publish or mutate content.
 * It checks canonical collection artifacts before a release.
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const fail = [];

function readJson(file) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) {
    fail.push(`missing: ${file}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    fail.push(`invalid json: ${file}: ${e.message}`);
    return null;
  }
}

function checkIndustry() {
  const manifest = readJson('news-index.json');
  if (!manifest) return;

  if (manifest.schema_version !== '3.0') {
    fail.push('Industry Radar manifest schema must be 3.0');
  }

  let total = 0;
  const ids = new Set();
  for (const segment of manifest.segments || []) {
    const data = readJson(segment.path);
    if (!data) continue;
    const count = (data.items || []).length;
    total += count;
    if (count !== segment.count) {
      fail.push(`${segment.path}: declared count ${segment.count}, actual ${count}`);
    }
    for (const item of data.items || []) {
      if (!item.id) fail.push(`${segment.path}: item missing id`);
      if (ids.has(item.id)) fail.push(`duplicate industry id: ${item.id}`);
      ids.add(item.id);
    }
  }

  if (total !== manifest.item_count) {
    fail.push(`Industry item_count mismatch: manifest ${manifest.item_count}, actual ${total}`);
  }
}

function checkConsumer() {
  const data = readJson('consumer-radar.json');
  if (!data) return;
  for (const item of data.items || []) {
    if (item.publication_mode === 'verbatim' && !item.body_markdown) {
      fail.push(`Consumer verbatim item missing body_markdown: ${item.id}`);
    }
  }
}

function checkDeepRead() {
  const data = readJson('deep-read.json');
  if (!data) return;
  for (const item of data.items || []) {
    if (item.content_status === 'published_verbatim' && !item.content_markdown) {
      fail.push(`Deep Read verbatim item missing content_markdown: ${item.id}`);
    }
  }
}

checkIndustry();
checkConsumer();
checkDeepRead();

if (fail.length) {
  console.error('VELNAR publish validation failed:');
  for (const item of fail) console.error(`- ${item}`);
  process.exit(1);
}

console.log('VELNAR publish validation passed.');
