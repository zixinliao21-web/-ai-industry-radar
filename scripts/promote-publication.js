#!/usr/bin/env node
'use strict';
const cp = require('child_process');
const path = require('path');
const root = path.resolve(__dirname, '..');
function git(...args) {
  return cp.execFileSync('git', args, {cwd: root, encoding: 'utf8'}).trim();
}
function collection(branch) {
  if (/^radar\/publish-[A-Za-z0-9][A-Za-z0-9-]*$/.test(branch)) return 'industry';
  if (/^consumer\/publish-[A-Za-z0-9][A-Za-z0-9-]*$/.test(branch)) return 'consumer';
  if (/^deep-read\/publish-[A-Za-z0-9][A-Za-z0-9-]*$/.test(branch)) return 'deep_read';
  throw new Error('Branch is not an allowed publication branch');
}
function allowed(file, kind) {
  if (kind === 'consumer') return file === 'consumer-radar.json';
  const prefix = kind === 'industry' ? 'news' : 'deep-read';
  return file === prefix + '-index.json' ||
    new RegExp('^' + prefix + '-index-segments/segment-[0-9]{4}\\.json$').test(file) ||
    new RegExp('^' + prefix + '-items/[A-Za-z0-9][A-Za-z0-9_-]*\\.json$').test(file);
}
function checkCandidate(branch, base, candidate) {
  const kind = collection(branch);
  if (!/^[0-9a-f]{40}$/.test(base) || !/^[0-9a-f]{40}$/.test(candidate)) throw new Error('Invalid commit SHA');
  if (git('show', '-s', '--format=%P', candidate) !== base) throw new Error('Candidate must have exactly current main as its sole parent');
  const fields = git('diff', '--raw', '-z', '--no-renames', base, candidate).split('\0');
  let count = 0;
  for (let i = 0; fields[i]; i += 2) {
    const match = /^:(\d+) (\d+) \S+ \S+ ([A-Z])$/.exec(fields[i]);
    const file = fields[i + 1];
    if (!match || !['A', 'M'].includes(match[3]) || match[2] !== '100644' ||
        (match[3] === 'M' && match[1] !== '100644') || !allowed(file, kind)) {
      throw new Error('Forbidden publication change: ' + file);
    }
    count++;
  }
  if (!count) throw new Error('Empty publication candidate');
  return kind;
}
function node(script, ...args) {
  return cp.execFileSync(process.execPath, [path.join(root, 'scripts', script), ...args], {cwd: root, encoding: 'utf8'});
}
function main() {
  const branch = process.env.PUBLICATION_BRANCH;
  collection(branch);
  const trusted = git('rev-parse', 'HEAD');
  git('fetch', 'origin', '+refs/heads/main:refs/remotes/origin/main',
    '+refs/heads/' + branch + ':refs/remotes/origin/publication');
  const base = git('rev-parse', 'refs/remotes/origin/main');
  const candidate = git('rev-parse', 'refs/remotes/origin/publication');
  if (process.env.EXPECTED_CANDIDATE_SHA && candidate !== process.env.EXPECTED_CANDIDATE_SHA) {
    throw new Error('Candidate moved since creation signal');
  }
  if (base !== trusted) throw new Error('Main moved since trusted workflow checkout; retry from current main');
  console.log(JSON.stringify({branch, base, candidate, collection: checkCandidate(branch, base, candidate)}));
  // Scope has proven every executable, workflow and release control unchanged.
  git('checkout', '--detach', candidate);
  console.log(node('validate-publish.js'));
  console.log(node('validate-change-scope.js', '--base', base));
  console.log(node('validate-history.js', '--base', base));
  const history = node('resolve-history-base.js', '--fallback', base).trim();
  console.log(node('validate-history.js', '--base', history));
  console.log(node('validate-runtime.js'));
  const remote = git('ls-remote', 'origin', 'refs/heads/main', 'refs/heads/' + branch);
  const refs = new Map(remote.split(/\r?\n/).map(line => line.split(/\s+/).reverse()));
  if (refs.get('refs/heads/main') !== base || refs.get('refs/heads/' + branch) !== candidate) {
    throw new Error('Main or candidate branch moved during validation');
  }
  if (process.env.PROMOTION_DRY_RUN === 'true') return;
  // Exact compare-and-swap; candidate is already proven a direct child of base.
  // The lease closes the race between the remote check and receive-pack.
  console.log(git('push', '--force-with-lease=refs/heads/main:' + base,
    'origin', candidate + ':refs/heads/main'));
  cp.execFileSync('gh', ['workflow', 'run', 'content-validation.yml', '--repo', process.env.GITHUB_REPOSITORY,
    '--ref', 'main', '-f', 'expected_sha=' + candidate, '-f', 'publication_base=' + base],
    {cwd: root, stdio: 'inherit'});
  console.log('Promoted ' + candidate + '; candidate branch retained. Content Validation dispatched.');
}
module.exports = {collection, allowed, checkCandidate};
if (require.main === module) {
  try { main(); } catch (error) { console.error(error.message); process.exit(1); }
}
