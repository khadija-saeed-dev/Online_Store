import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { createUserToken, isJwtConfigured } from '../utils/jwt.js';

const saltRounds = 12;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    city: user.city,
    postalCode: user.postalCode,
    createdAt: user.createdAt,
  };
}

function requireAuthConfiguration(response) {
  if (!isJwtConfigured()) {
    response.status(503).json({
      success: false,
      message: 'Authentication is not configured. Set JWT_SECRET in backend/.env.',
    });
    return false;
  }

  if (mongoose.connection.readyState !== 1) {
    response.status(503).json({ success: false, message: 'Database is not connected.' });
    return false;
  }

  return true;
}

function sendAuthError(response, error) {
  if (error.code === 11000) {
    response.status(409).json({ success: false, message: 'An account with this email already exists.' });
    return;
  }

  const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
  const message = statusCode < 500 ? error.message : 'Unable to complete the authentication request.';
  response.status(statusCode).json({ success: false, message });
}

export async function registerUser(request, response) {
  try {
    const { name, email, password } = request.body || {};
    if (typeof name !== 'string' || !name.trim()) {
      response.status(400).json({ success: false, message: 'Name is required.' });
      return;
    }
    if (typeof email !== 'string' || !emailPattern.test(email.trim())) {
      response.status(400).json({ success: false, message: 'Enter a valid email address.' });
      return;
    }
    if (typeof password !== 'string' || password.length < 8) {
      response.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
      return;
    }
    if (!requireAuthConfiguration(response)) return;

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      response.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user',
    });

    const token = createUserToken(user);
    response.status(201).json({ success: true, data: { user: safeUser(user), token } });
  } catch (error) {
    sendAuthError(response, error);
  }
}

export async function loginUser(request, response) {
  try {
    const { email, password } = request.body || {};
    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
      response.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }
    if (!requireAuthConfiguration(response)) return;

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    const passwordMatches = user && await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      response.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = createUserToken(user);
    response.json({ success: true, data: { user: safeUser(user), token } });
  } catch (error) {
    sendAuthError(response, error);
  }
}

export function getCurrentUser(request, response) {
  response.json({ success: true, data: { user: safeUser(request.user) } });
}