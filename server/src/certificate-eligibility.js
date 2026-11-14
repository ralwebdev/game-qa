import { completedIds } from './curriculum.js';

export function certificateProgress(user, modules, validBugs) {
  const done = new Set(completedIds(user));
  const completed = modules.filter(module => done.has(module._id)).length;
  return { completed, validBugs, eligible: completed >= 22 && validBugs >= 2 };
}
