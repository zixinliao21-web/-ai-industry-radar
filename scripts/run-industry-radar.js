#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const MANIFEST_PATH = 'news-index.json';
const PRODUCT_PATH = 'PRODUCT.md';
const AGENTS_PATH = 'AGENTS.md';
const PUBLISHING_PATH = 'docs/industry-radar-publishing.md';
const DEFAULT_MODEL = 'gpt-6-sol';
const MAX_CANDIDATES = 3;

function fail(message) {
  console.error(`VELNAR autonomous publisher failed: ${message}`);
  process.exitCode = 1;
  throw new Error(message);
}

function readText(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function readJson(rel) {
  return JSON.parse(readText(rel));
}

function writeJson(rel, value) {
  const target = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const temp = `${target}.tmp-${process.pid}`;
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(temp, target);
}

function normalizeTitle(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]+/gu, '');
}

function normalizeUrl(value) {
  try {
    const url = new URL(value);
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|spm$|ref$|source$|campaign$)/i.test(key)) url.searchParams.delete(key);
    }
    return url.toString().replace(/\/$/, '');
  } catch {
    return '';
  }
}

function shanghaiParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(date).reduce((acc, item) => {
    acc[item.type] = item.value;
    return acc;
  }, {});
  return parts;
}

function shanghaiDate(date = new Date()) {
  const p = shanghaiParts(date);
  return `${p.year}-${p.month}-${p.day}`;
}

function shanghaiTimestamp(date = new Date()) {
  const p = shanghaiParts(date);
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute} +08:00`;
}

function assertContract() {
  const product = readText(PRODUCT_PATH);
  const agents = readText(AGENTS_PATH);
  const publishing = readText(PUBLISHING_PATH);
  const manifest = readJson(MANIFEST_PATH);

  if (!product.includes('not an AI news site') && !product.includes('不是')) {
    fail('PRODUCT.md no longer exposes the expected Radar editorial boundary.');
  }
  if (!agents.includes('Atomic publication transactions')) {
    fail('AGENTS.md no longer exposes the expected atomic publication contract.');
  }
  if (!publishing.includes('Preferred path — atomic Git transaction')) {
    fail('Industry publishing contract no longer exposes the expected atomic transaction path.');
  }
  if (manifest.schema_version !== '3.0' || manifest.storage !== 'segmented_index' || manifest.segment_size !== 8) {
    fail('Industry manifest contract changed; refusing to guess a new publishing shape.');
  }
  if (!Array.isArray(manifest.segments) || manifest.segments.length === 0) {
    fail('Industry manifest has no segments.');
  }

  return { product, manifest };
}

function loadArchive(manifest) {
  const metadata = [];
  const items = new Map();
  const sourceUrls = new Set();

  for (const descriptor of manifest.segments) {
    const segment = readJson(descriptor.path);
    if (!Array.isArray(segment.items) || segment.items.length !== descriptor.count) {
      fail(`${descriptor.path} count differs from manifest before research starts.`);
    }
    for (const meta of segment.items) metadata.push(meta);
  }

  const itemDir = path.join(ROOT, 'news-items');
  if (fs.existsSync(itemDir)) {
    for (const filename of fs.readdirSync(itemDir)) {
      if (!filename.endsWith('.json')) continue;
      try {
        const item = JSON.parse(fs.readFileSync(path.join(itemDir, filename), 'utf8'));
        if (item && item.id) items.set(item.id, item);
        for (const source of Array.isArray(item?.sources) ? item.sources : []) {
          const normalized = normalizeUrl(source?.url);
          if (normalized) sourceUrls.add(normalized);
        }
      } catch (error) {
        fail(`Cannot parse news-items/${filename}: ${error.message}`);
      }
    }
  }

  return { metadata, items, sourceUrls };
}

function compactEditorialContext(product, metadata) {
  const productExcerpt = product.slice(0, 9000);
  const archive = metadata.map((item) => ({
    id: item.id,
    date: item.date,
    grade: item.grade,
    title: item.title,
    themes: item.themes,
    deck: item.deck,
  }));
  return { productExcerpt, archive };
}

const candidateSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    publish: { type: 'boolean' },
    scan_summary: { type: 'string' },
    candidates: {
      type: 'array',
      maxItems: MAX_CANDIDATES,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          grade: { type: 'string', enum: ['S', 'A', 'B'] },
          title: { type: 'string' },
          themes: { type: 'array', items: { type: 'string' }, maxItems: 8 },
          deck: { type: 'string' },
          article_text: { type: 'string' },
          fact: { type: 'string' },
          inference: { type: 'string' },
          prediction: { type: 'string' },
          velnar_action: { type: 'string' },
          sources: {
            type: 'array',
            maxItems: 8,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                name: { type: 'string' },
                url: { type: 'string' },
              },
              required: ['name', 'url'],
            },
          },
        },
        required: [
          'grade', 'title', 'themes', 'deck', 'article_text', 'fact',
          'inference', 'prediction', 'velnar_action', 'sources',
        ],
      },
    },
  },
  required: ['publish', 'scan_summary', 'candidates'],
};

function extractOutputText(response) {
  const chunks = [];
  for (const item of Array.isArray(response?.output) ? response.output : []) {
    if (item?.type !== 'message') continue;
    for (const content of Array.isArray(item.content) ? item.content : []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') chunks.push(content.text);
      if (content?.type === 'refusal') fail(`Model refused the research request: ${content.refusal || 'unknown refusal'}`);
    }
  }
  if (!chunks.length) fail('Responses API returned no output_text.');
  return chunks.join('\n');
}

async function callResearchModel(context) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) fail('OPENAI_API_KEY is not configured.');

  const model = process.env.OPENAI_RADAR_MODEL || DEFAULT_MODEL;
  const today = shanghaiDate();
  const input = `Current date in VELNAR operating timezone (Asia/Shanghai): ${today}.\n\n` +
    `You are the autonomous research editor for VELNAR AI Industry Radar. Search the live web before deciding. ` +
    `This is not a news feed. Publish only genuinely meaningful S/A/B signals that improve the strategic model. ` +
    `Prefer primary sources, company/financial disclosures, reputable research, academic work, and high-quality reporting. ` +
    `Focus on developments from the last 48 hours; you may reach back up to 7 days only for a clearly overlooked structural signal. ` +
    `Routine launches, recycled concepts, marketing claims without evidence, and low-value funding news do not qualify.\n\n` +
    `S = could materially change the industry map or a core strategic assumption. ` +
    `A = important validation or an emerging structural signal. ` +
    `B = ordinary but genuinely useful evidence worth retaining.\n\n` +
    `Deduplicate aggressively against the existing archive metadata below. If the same underlying signal is already represented, do not republish it with a different headline. ` +
    `Return publish=false and an empty candidates array when nothing qualifies. There is no publication quota.\n\n` +
    `For each qualifying signal, produce one complete Chinese canonical article. The title must be insight-first. ` +
    `The article must answer: what happened; why it matters to us; which prior judgment is strengthened/weakened/refined/unchanged; ` +
    `what we should not conclude; and 1-3 concrete follow-up questions. Separate FACT / INFERENCE / PREDICTION where useful. ` +
    `Do not expand the current enterprise Sales MVP merely because a new industry concept appears. ` +
    `article_text is the exact website body and should begin with the exact title, followed by a blank line.\n\n` +
    `PRODUCT CONTRACT EXCERPT:\n${context.productExcerpt}\n\n` +
    `EXISTING ARCHIVE METADATA (${context.archive.length} items):\n${JSON.stringify(context.archive)}`;

  const payload = {
    model,
    reasoning: { effort: 'medium' },
    tools: [{ type: 'web_search', search_context_size: 'medium' }],
    tool_choice: 'required',
    include: ['web_search_call.action.sources'],
    input,
    text: {
      format: {
        type: 'json_schema',
        name: 'velnar_industry_radar_scan',
        strict: true,
        schema: candidateSchema,
      },
    },
    max_output_tokens: 14000,
  };

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  if (!response.ok) fail(`OpenAI Responses API returned ${response.status}: ${raw.slice(0, 1500)}`);

  let decoded;
  try {
    decoded = JSON.parse(raw);
  } catch {
    fail('OpenAI Responses API returned non-JSON transport data.');
  }

  const text = extractOutputText(decoded);
  try {
    return JSON.parse(text);
  } catch (error) {
    fail(`Structured output was not valid JSON: ${error.message}`);
  }
}

function validateCandidate(candidate) {
  if (!['S', 'A', 'B'].includes(candidate.grade)) return 'invalid grade';
  if (!candidate.title || candidate.title.length < 12) return 'title too short';
  if (!candidate.deck || candidate.deck.length < 40) return 'deck too short';
  if (!candidate.article_text || candidate.article_text.length < 600) return 'article_text too short';
  if (!Array.isArray(candidate.themes) || candidate.themes.length < 2) return 'too few themes';
  if (!Array.isArray(candidate.sources) || candidate.sources.length < 2) return 'too few sources';
  for (const source of candidate.sources) {
    if (!source?.name || !normalizeUrl(source?.url)) return 'invalid source';
  }
  return null;
}

function nextArticleId(date, grade, occupied) {
  let max = 0;
  const prefix = `${date}-${grade}`;
  for (const id of occupied) {
    if (!String(id).startsWith(prefix)) continue;
    const suffix = Number(String(id).slice(prefix.length));
    if (Number.isInteger(suffix)) max = Math.max(max, suffix);
  }
  return `${prefix}${max + 1}`;
}

function nextSegmentId(manifest) {
  const max = manifest.segments.reduce((acc, descriptor) => Math.max(acc, Number(descriptor.id) || 0), 0);
  return String(max + 1).padStart(4, '0');
}

function candidateIsDuplicate(candidate, archive, acceptedTitles, acceptedSources) {
  const titleKey = normalizeTitle(candidate.title);
  if (!titleKey) return true;
  if (archive.metadata.some((item) => normalizeTitle(item.title) === titleKey)) return true;
  if (acceptedTitles.has(titleKey)) return true;

  const urls = candidate.sources.map((s) => normalizeUrl(s.url)).filter(Boolean);
  if (urls.some((url) => archive.sourceUrls.has(url) || acceptedSources.has(url))) return true;
  return false;
}

function preparePublications(scan, archive) {
  const proposed = Array.isArray(scan?.candidates) ? scan.candidates.slice(0, MAX_CANDIDATES) : [];
  if (!scan?.publish || proposed.length === 0) return [];

  const occupied = new Set(archive.metadata.map((item) => item.id));
  const acceptedTitles = new Set();
  const acceptedSources = new Set();
  const date = shanghaiDate();
  const publications = [];

  for (const candidate of proposed) {
    const error = validateCandidate(candidate);
    if (error) {
      console.warn(`Skip malformed candidate (${error}): ${candidate?.title || '<untitled>'}`);
      continue;
    }
    if (candidateIsDuplicate(candidate, archive, acceptedTitles, acceptedSources)) {
      console.log(`Skip duplicate candidate: ${candidate.title}`);
      continue;
    }

    const id = nextArticleId(date, candidate.grade, occupied);
    occupied.add(id);
    acceptedTitles.add(normalizeTitle(candidate.title));
    for (const source of candidate.sources) acceptedSources.add(normalizeUrl(source.url));

    const articleText = candidate.article_text.startsWith(candidate.title)
      ? candidate.article_text
      : `${candidate.title}\n\n${candidate.article_text}`;

    publications.push({
      id,
      date,
      grade: candidate.grade,
      title: candidate.title.trim(),
      themes: [...new Set(candidate.themes.map((x) => String(x).trim()).filter(Boolean))].slice(0, 8),
      deck: candidate.deck.trim(),
      article_text: articleText.trim(),
      sources: candidate.sources.map((source) => ({ name: source.name.trim(), url: normalizeUrl(source.url) })),
      fact: candidate.fact.trim(),
      inference: candidate.inference.trim(),
      prediction: candidate.prediction.trim(),
      velnar_action: candidate.velnar_action.trim(),
    });
  }

  return publications;
}

function applyPublications(manifest, publications) {
  const nextManifest = JSON.parse(JSON.stringify(manifest));
  const segmentCache = new Map();

  function getSegment(descriptor) {
    if (!segmentCache.has(descriptor.path)) segmentCache.set(descriptor.path, readJson(descriptor.path));
    return segmentCache.get(descriptor.path);
  }

  for (const publication of publications) {
    let descriptor = nextManifest.segments[nextManifest.segments.length - 1];
    let segment = getSegment(descriptor);

    if (descriptor.sealed || descriptor.count >= nextManifest.segment_size || segment.items.length >= nextManifest.segment_size) {
      const id = nextSegmentId(nextManifest);
      const segmentPath = `news-index-segments/segment-${id}.json`;
      descriptor = { id, path: segmentPath, count: 0, sealed: false };
      nextManifest.segments.push(descriptor);
      segment = { schema_version: '3.0', segment: id, items: [] };
      segmentCache.set(segmentPath, segment);
    }

    segment.items.push({
      id: publication.id,
      date: publication.date,
      grade: publication.grade,
      title: publication.title,
      themes: publication.themes,
      deck: publication.deck,
      body_format: 'article_text',
    });

    descriptor.count = segment.items.length;
    descriptor.sealed = descriptor.count === nextManifest.segment_size;
    nextManifest.item_count += 1;
    writeJson(`news-items/${publication.id}.json`, publication);
  }

  nextManifest.updated_at = shanghaiTimestamp();
  for (const [segmentPath, segment] of segmentCache.entries()) writeJson(segmentPath, segment);
  writeJson(MANIFEST_PATH, nextManifest);
}

function emitGithubOutput(key, value) {
  const output = process.env.GITHUB_OUTPUT;
  if (!output) return;
  fs.appendFileSync(output, `${key}=${String(value).replace(/\n/g, ' ')}\n`, 'utf8');
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const selfTest = args.has('--self-test');
  const dryRun = args.has('--dry-run');

  const contract = assertContract();
  const archive = loadArchive(contract.manifest);
  if (archive.metadata.length !== contract.manifest.item_count) {
    fail(`Manifest item_count=${contract.manifest.item_count}, but indexed metadata=${archive.metadata.length}.`);
  }

  if (selfTest) {
    console.log(`VELNAR autonomous publisher self-test passed: ${archive.metadata.length} indexed Industry items.`);
    emitGithubOutput('changed', 'false');
    emitGithubOutput('count', 0);
    return;
  }

  const context = compactEditorialContext(contract.product, archive.metadata);
  const scan = await callResearchModel(context);
  const publications = preparePublications(scan, archive);

  console.log(`Research scan complete. Qualifying new publications after dedupe: ${publications.length}.`);
  if (scan.scan_summary) console.log(`Scan summary: ${scan.scan_summary}`);

  if (publications.length === 0) {
    emitGithubOutput('changed', 'false');
    emitGithubOutput('count', 0);
    return;
  }

  for (const article of publications) console.log(`Candidate ${article.id} [${article.grade}] ${article.title}`);

  if (dryRun) {
    console.log('Dry run: no canonical files were modified.');
    emitGithubOutput('changed', 'false');
    emitGithubOutput('count', publications.length);
    return;
  }

  applyPublications(contract.manifest, publications);
  emitGithubOutput('changed', 'true');
  emitGithubOutput('count', publications.length);
  emitGithubOutput('ids', publications.map((x) => x.id).join(','));
  console.log(`Prepared ${publications.length} canonical publication(s) in the working tree.`);
}

main().catch((error) => {
  if (!process.exitCode) process.exitCode = 1;
  console.error(error?.stack || error);
});
