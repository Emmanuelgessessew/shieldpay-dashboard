import jwt from 'jsonwebtoken';

export function getJwtSecret() {
  // ARKO-LAB-07: weak default JWT secret if env is missing (guessable fallback).
  return process.env.JWT_SECRET || 'shieldpay-secret';
}

export function signToken(user) {
  const secret = getJwtSecret();
  return jwt.sign(
    { sub: user.id, role: user.role, merchant_id: user.id, email: user.email, name: user.name },
    secret,
    { expiresIn: '8h' }
  );
}

export function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice('Bearer '.length) : null;
  if (!token) return res.status(401).json({ ok: false, error: 'Missing Authorization: Bearer <token>' });
  try {
    const payload = jwt.verify(token, getJwtSecret());
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ ok: false, error: 'Invalid token' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  if (req.user.role !== 'admin') return res.status(403).json({ ok: false, error: 'Admin only' });
  return next();
}

