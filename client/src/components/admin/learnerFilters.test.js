import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { matchesLearnerFilter as matches } from './learnerFilters.js';

test('progress filters distinguish module completion and bug report status', () => {
  assert.equal(matches({ completed: 11 }, 'over-half', 22), false);
  assert.equal(matches({ completed: 12 }, 'over-half', 22), true);
  assert.equal(matches({ completed: 22, bugCount: 0 }, 'no-bugs', 22), true);
  assert.equal(matches({ completed: 21, bugCount: 0 }, 'no-bugs', 22), false);
  assert.equal(matches({ completed: 22, bugCount: 1, validBugs: 1 }, 'needs-reviewed-bugs', 22), true);
  assert.equal(matches({ completed: 22, bugCount: 0, validBugs: 0 }, 'needs-reviewed-bugs', 22), false);
  assert.equal(matches({ completed: 22, bugCount: 2, validBugs: 2 }, 'needs-reviewed-bugs', 22), false);
  assert.equal(matches({ completed: 0, bugCount: 0 }, 'no-bugs', 0), false);
  assert.equal(matches({ eligible: true }, 'eligible', 22), true);
});
