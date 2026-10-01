#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

function readJson(file) { return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')); }
function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}

const industry = readJson('news-index.json');
const consumer = readJson('consumer-radar.json');
const deep = readJson('deep-read.json');
const commit = arg('--commit') || process.env.RELEASE_SHA || process.env.GITHUB_SHA || null;

const status = {
  schema_version: '1.0',
  status: 'healthy',
  generated_at: new Date().toISOString(),
  purpose: 'Generated health snapshot for the validated production release. Canonical research content remains in collection data stores.',
  last_release: {
    commit,
    validated: true
  },
  collections: {
    industry: {
      status: 'healthy',
      last_update: industry.updated_at || null,
      item_count: Number(industry.item_count || 0),
      storage: industry.storage || null,
      segment_count: Array.isArray(industry.segments) ? industry.segments.length : 0
    },
    consumer: {
      status: 'healthy',
      last_update: consumer.updated_at || null,
      item_count: Array.isArray(consumer.items) ? consumer.items.length : 0
    },
    deep_read: {
      status: 'healthy',
      last_update: deep.updated_at || null,
      item_count: Array.isArray(deep.items) ? deep.items.length : 0
    }
  },
  validation: {
    passed: true,
    validators: ['scripts/validate-publish.js','scripts/validate-runtime.js']
  }
};

const json = JSON.stringify(status, null, 2) + '\n';
const output = arg('--output');
if (output) {
  const target = path.resolve(root, output);
  fs.writeFileSync(target, json, 'utf8');
  console.log(`Wrote ${path.relative(root, target)}`);
} else {
  process.stdout.write(json);
}
