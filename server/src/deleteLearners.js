export async function deleteLearners({ User, Bug, TestCase, Feedback, Certificate }, expectedCount) {
  const learners = await User.find({ role: 'learner', learnerRole: 'Student' }).select('_id').lean();
  if (learners.length !== expectedCount) {
    const error = new Error('The student count changed. Refresh the page and review it before trying again.');
    error.status = 409;
    throw error;
  }
  const ids = learners.map(user => user._id);
  for (const Model of [Bug, TestCase, Feedback, Certificate]) await Model.deleteMany({ user: { $in: ids } });
  return User.deleteMany({ _id: { $in: ids }, role: 'learner', learnerRole: 'Student' });
}
