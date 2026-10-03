'use strict';
const assert = require('node:assert/strict');
const {verifyRun} = require('./verify-validation-run');
const sha = 'a'.repeat(40), repo = 'owner/research';
const good = {head_sha: sha, head_branch: 'main', path: '.github/workflows/content-validation.yml',
  repository: {full_name: repo}, event: 'workflow_dispatch', status: 'completed', conclusion: 'success'};
assert.equal(verifyRun(good, sha, repo), true);
assert.equal(verifyRun({...good, status: 'in_progress', conclusion: null}, sha, repo), false);
for (const patch of [
  {head_sha: 'b'.repeat(40)}, {head_branch: 'candidate'}, {path: '.github/workflows/other.yml'},
  {repository: {full_name: 'attacker/research'}}, {event: 'pull_request'},
  {conclusion: 'failure'}, {conclusion: 'cancelled'}, {conclusion: 'skipped'}
]) assert.throws(() => verifyRun({...good, ...patch}, sha, repo));
console.log('Validation proof safety tests passed: 10');
