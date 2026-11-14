import test from 'node:test';
import assert from 'node:assert/strict';
import { modules } from './curriculum.js';
import { certificateProgress } from './certificate-eligibility.js';

const userWith = (count) => ({ completedCourseModules: modules.slice(0, count).map(m => m.legacyId) });
test('certificate eligibility requires 22 distinct course modules and two reviewed reports', () => {
  assert.equal(certificateProgress(userWith(21), modules, 2).eligible, false);
  assert.equal(certificateProgress(userWith(22), modules, 1).eligible, false);
  assert.equal(certificateProgress(userWith(22), modules, 2).eligible, true);
  const user = userWith(21);
  user.completedCourseModules.push(user.completedCourseModules[0], 999999);
  assert.equal(certificateProgress(user, modules, 2).eligible, false);
});
