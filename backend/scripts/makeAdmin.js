import { config } from 'dotenv';
import mongoose from 'mongoose';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';

const backendDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: resolve(backendDirectory, '.env') });

const email = (process.argv[2] || process.env.ADMIN_EMAIL || '').trim().toLowerCase();

if (!email) {
  console.error('Provide a target email argument or set ADMIN_EMAIL.');
  process.exitCode = 1;
} else {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not configured.');
    }

    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('No existing user was found for the provided email.');
    }

    user.role = 'admin';
    await user.save();
    console.log('Existing user promoted to admin.');
  } catch {
    console.error('Admin promotion failed. Check the target user and backend configuration.');
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}