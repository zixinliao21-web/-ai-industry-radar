#!/usr/bin/env node
'use strict';
const cp = require('child_process');
const expected = process.env.EXPECTED_SHA;
const runId = process.env.VALIDATED_RUN_ID;
function verifyRun(run, sha, repo) {
  if (run.head_sha !== sha || run.head_branch !== 'main' ||
      run.path !== '.github/workflows/content-validation.yml' ||
      run.repository.full_name !== repo ||
      !['push', 'workflow_dispatch'].includes(run.event)) throw new Error('Validation proof does not identify a main Content Validation run');
  if (run.status !== 'completed') return false;
  if (run.conclusion !== 'success') throw new Error('Content Validation did not succeed');
  return true;
}
async function main() {
  if (!/^[0-9a-f]{40}$/.test(expected || '') || !/^[0-9]+$/.test(runId || '')) throw new Error('Invalid validation proof inputs');
  if (process.env.GITHUB_REF !== 'refs/heads/main' || process.env.GITHUB_SHA !== expected) throw new Error('Dispatch must target the exact validated main');
  // The source may still be finishing its final dispatch step. Never deploy
  // until GitHub records the entire Content Validation run as successful.
  for (let attempt = 0; attempt < 15; attempt++) {
    const run = JSON.parse(cp.execFileSync('gh', ['api', 'repos/' + process.env.GITHUB_REPOSITORY + '/actions/runs/' + runId], {encoding: 'utf8'}));
    if (verifyRun(run, expected, process.env.GITHUB_REPOSITORY)) {
      console.log('Verified successful Content Validation run ' + runId + ' for ' + expected);
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  throw new Error('Content Validation proof did not complete in time');
}
module.exports = {verifyRun};
if (require.main === module) main().catch(error => { console.error(error.message); process.exit(1); });
