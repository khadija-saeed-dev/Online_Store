import mongoose from 'mongoose';
import User from '../models/User.js';
import { verifyUserToken } from '../utils/jwt.js';

const respond = (response, status, message) => response.status(status).json({ success: false, message });

export async function protect(request, response, next) {
  const authorization = request.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+([^\s]+)$/i);

  if (!match) {
    respond(response, 401, 'Authentication required.');
    return;
  }

  let payload;
  try {
    payload = verifyUserToken(match[1]);
  } catch (error) {
    if (error.statusCode === 503) {
      respond(response, 503, error.message);
      return;
    }
    respond(response, 401, 'Invalid or expired token.');
    return;
  }

  if (!payload || typeof payload !== 'object' || !mongoose.isValidObjectId(payload.userId)) {
    respond(response, 401, 'Invalid or expired token.');
    return;
  }

  if (mongoose.connection.readyState !== 1) {
    respond(response, 503, 'Unable to verify the session because the database is not connected.');
    return;
  }

  try {
    const user = await User.findById(payload.userId);
    if (!user) {
      respond(response, 401, 'Invalid or expired token.');
      return;
    }

    request.user = user;
    next();
  } catch {
    respond(response, 503, 'Unable to verify the session. Please try again.');
  }
}

export function adminOnly(request, response, next) {
  if (!request.user) {
    respond(response, 401, 'Authentication required.');
    return;
  }

  if (request.user.role !== 'admin') {
    respond(response, 403, 'Admin access required.');
    return;
  }

  next();
}