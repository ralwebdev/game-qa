import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'node:fs';
import { Module, Theory } from './models.js';
const modules = JSON.parse(fs.readFileSync('src/modules.json', 'utf8'));
const theory = JSON.parse(fs.readFileSync('src/theory.json', 'utf8'));
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/game_qa_academy', { serverSelectionTimeoutMS: 5000 });
try {
  const keep = [];
  for (const [i, { id, ...content }] of modules.entries()) {
    const m = await Module.findOneAndUpdate({ legacyId: id }, { $set: { ...content, legacyId: id, order: i + 1, published: true } }, { upsert: true, new: true, runValidators: true });
    keep.push(m._id);
  }
  await Module.deleteMany({ _id: { $nin: keep } });
  await Theory.deleteMany({});
  await Theory.insertMany(theory.map(({ id, ...content }) => ({ ...content, published: true })));
  console.log(`Installed ${keep.length} individual modules and ${await Theory.countDocuments()} theory slides.`);
} finally { await mongoose.disconnect(); }
