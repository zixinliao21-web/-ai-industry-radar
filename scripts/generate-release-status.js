#!/usr/bin/env node

/**
 * VELNAR Research release status generator.
 *
 * Phase 1: produces a machine-readable health snapshot from canonical
 * collection metadata. It does not publish content or mutate research data.
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'release-status.json');

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function safeRead(file) {
  try {
    return readJson(file);
  } catch (_) {
    return null;
  }
}

const industry = safeRead('news-index.json');
const consumer = safeRead('consumer-radar.json');
const deepRead = safeRead('deep-read.json');

const status = {
  schema_version: '1.0',
  generated_at: new Date().toISOString(),
  collections: {
    industry: {
      available: !!industry,
      item_count: industry?.item_count ?? null,
      updated_at: industry?.updated_at ?? null
    },
    consumer: {
      available: !!consumer,
      item_count: consumer?.items?.length ?? null,
      updated_at: consumer?.updated_at ?? null
    },
    deep_read: {
      available: !!deepRead,
      item_count: deepRead?.items?.length ?? null,
      updated_at: deepRead?.updated_at ?? null
    }
  }
};

fs.writeFileSync(out, JSON.stringify(status, null, 2) + '\n');
console.log('release-status.json generated.');
