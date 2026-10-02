import jwt from 'jsonwebtoken';

export const jwtConfigurationMessage = 'Authentication is not configured. Set JWT_SECRET in backend/.env.';

export function isJwtConfigured() {
  return Boolean(process.env.JWT_SECRET);
}

export function createUserToken(user) {
  if (!process.env.JWT_SECRET) {
    const error = new Error(jwtConfigurationMessage);
    error.statusCode = 503;
    throw error;
  }

  return jwt.sign(
    { userId: String(user._id), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
}

export function verifyUserToken(token) {
  if (!process.env.JWT_SECRET) {
    const error = new Error(jwtConfigurationMessage);
    error.statusCode = 503;
    throw error;
  }

  return jwt.verify(token, process.env.JWT_SECRET);
}