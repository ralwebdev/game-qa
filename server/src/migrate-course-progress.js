import 'dotenv/config';
import mongoose from 'mongoose';
import { User, Module } from './models.js';
import { modules } from './curriculum.js';
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/game_qa_academy');
try {
  const valid = new Set(modules.map(m => m.legacyId));
  const legacy = await Module.find({ legacyId: { $in: [...valid] } }).select('_id legacyId').lean();
  const mapping = new Map(legacy.map(m => [String(m._id), m.legacyId]));
  let matched = 0, unmatched = 0;
  for await (const user of User.find({ 'completedModules.0': { $exists: true } }).select('completedModules').cursor()) {
    const ids = [...new Set(user.completedModules.map(id => mapping.get(String(id))).filter(Boolean))];
    unmatched += user.completedModules.length - user.completedModules.filter(id => mapping.has(String(id))).length;
    if (ids.length) { await User.updateOne({ _id: user._id }, { $addToSet: { completedCourseModules: { $each: ids } } }); matched += ids.length; }
  }
  console.log(`Migrated ${matched} matched completions; ${unmatched} old references had no matching current module.`);
} finally { await mongoose.disconnect(); }
