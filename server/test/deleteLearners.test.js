import test from 'node:test';
import assert from 'node:assert/strict';
import { deleteLearners } from '../src/deleteLearners.js';

function fakeModels() {
  const calls = [];
  const User = {
    find(query) { calls.push(['find', query]); return { select() { return { lean: async () => [{ _id: 'learner-1' }, { _id: 'learner-2' }] }; } }; },
    async deleteMany(query) { calls.push(['users', query]); return { deletedCount: 2 }; }
  };
  const related = name => ({ async deleteMany(query) { calls.push([name, query]); } });
  return { calls, models: { User, Bug: related('bugs'), TestCase: related('cases'), Feedback: related('feedback'), Certificate: related('certificates') } };
}

test('deletes only selected student accounts and their associated records', async () => {
  const { calls, models } = fakeModels();
  assert.equal((await deleteLearners(models, 2)).deletedCount, 2);
  assert.deepEqual(calls[0], ['find', { role: 'learner', learnerRole: 'Student' }]);
  for (const [, query] of calls.slice(1, -1)) assert.deepEqual(query, { user: { $in: ['learner-1', 'learner-2'] } });
  assert.deepEqual(calls.at(-1), ['users', { _id: { $in: ['learner-1', 'learner-2'] }, role: 'learner', learnerRole: 'Student' }]);
});

test('does not delete anything if the learner count changes', async () => {
  const { calls, models } = fakeModels();
  await assert.rejects(deleteLearners(models, 1), error => error.status === 409);
  assert.equal(calls.length, 1);
});
