import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './models.js';
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/game_qa_academy');
try {
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    if (process.env.ADMIN_PASSWORD.length < 12) throw Error('ADMIN_PASSWORD must contain at least 12 characters');
    await User.updateOne({ email: process.env.ADMIN_EMAIL.toLowerCase() }, { $setOnInsert: { name: 'Academy Admin', email: process.env.ADMIN_EMAIL.toLowerCase(), passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12), role: 'admin' } }, { upsert: true });
    console.log('Admin account provisioned (if not already present)');
  } else console.log('Set ADMIN_EMAIL and ADMIN_PASSWORD to provision admin');
  console.log('Course content is loaded from application files');
} finally { await mongoose.disconnect(); }
