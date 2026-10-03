'use strict';
const assert = require('node:assert/strict');
const cp = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {collection, checkCandidate} = require('./promote-publication');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'velnar-promoter-'));
const original = process.cwd();
let tests = 0;
function git(...args) { return cp.execFileSync('git', args, {cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).trim(); }
function commit(file, content) {
  fs.mkdirSync(path.dirname(path.join(dir, file)), {recursive: true});
  fs.writeFileSync(path.join(dir, file), content);
  git('add', '.'); git('commit', '-qm', 'fixture'); return git('rev-parse', 'HEAD');
}
// checkCandidate uses the actual repository root: fixtures are disposable commits
// in a standalone copy of the script, so no production data is ever touched.
try {
  fs.mkdirSync(path.join(dir, 'scripts'));
  fs.copyFileSync(path.join(__dirname, 'promote-publication.js'), path.join(dir, 'scripts/promote-publication.js'));
  const check = require(path.join(dir, 'scripts/promote-publication.js')).checkCandidate;
  git('init', '-q'); git('config', 'user.name', 'Test'); git('config', 'user.email', 'test@example.invalid');
  const base = commit('README.md', 'baseline');
  for (const [branch, file, kind] of [
    ['radar/publish-test', 'news-items/test.json', 'industry'],
    ['consumer/publish-test', 'consumer-radar.json', 'consumer'],
    ['deep-read/publish-test', 'deep-read-items/test.json', 'deep_read']
  ]) {
    git('reset', '--hard', base);
    const candidate = commit(file, '{}');
    assert.equal(check(branch, base, candidate), kind); tests++;
    assert.throws(() => check(branch, candidate, candidate)); tests++;
  }
  for (const file of ['scripts/evil.js', 'docs/hidden.md', 'consumer-radar.json', 'news.json', 'release-lock.json']) {
    git('reset', '--hard', base);
    assert.throws(() => check('radar/publish-test', base, commit(file, '{}'))); tests++;
  }
  assert.throws(() => collection('radar/publish-test/evil')); tests++;
  git('reset', '--hard', base);
  const candidate = commit('news-items/test.json', '{}');
  git('branch', 'main', base);
  // A successful CAS advances exactly the checked direct child.
  git('push', '--force-with-lease=refs/heads/main:' + base, dir, candidate + ':refs/heads/main');
  assert.equal(git('rev-parse', 'main'), candidate); tests++;
  // A concurrent main update must reject the exact same stale lease.
  assert.throws(() => git('push', '--force-with-lease=refs/heads/main:' + base, dir, base + ':refs/heads/main')); tests++;
  assert.equal(git('rev-parse', 'main'), candidate);
  console.log('Publication promoter safety tests passed: ' + tests);
} finally {
  process.chdir(original);
  fs.rmSync(dir, {recursive: true, force: true});
}
