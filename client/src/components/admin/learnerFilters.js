export function matchesLearnerFilter(user, filter, moduleCount) {
  const completed = user.completed ?? 0;
  const allModulesCompleted = moduleCount > 0 && completed >= moduleCount;
  switch (filter) {
    case 'eligible': return Boolean(user.eligible);
    case 'over-half': return moduleCount > 0 && completed > moduleCount / 2 && completed < moduleCount;
    case 'no-bugs': return allModulesCompleted && (user.bugCount ?? 0) === 0;
    case 'needs-reviewed-bugs': return allModulesCompleted && (user.bugCount ?? 0) > 0 && (user.validBugs ?? 0) < 2;
    default: return true;
  }
}
