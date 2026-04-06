import express from 'express';
import bcrypt from 'bcrypt';
import { signToken, requireAuth } from '../auth.js';

export function authRoutes(db) {
  const router = express.Router();

  router.post('/register', async (req, res, next) => {
    try {
      const { name, email, password } = req.body || {};
      if (!name || !email || !password) return res.status(400).json({ ok: false, error: 'Missing fields' });
      const exists = db.prepare('SELECT id FROM merchants WHERE email = ?').get(String(email).toLowerCase());
      if (exists) return res.status(409).json({ ok: false, error: 'Email already registered' });
      const password_hash = await bcrypt.hash(String(password), 10);
      const info = db
        .prepare('INSERT INTO merchants (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
        .run(String(name), String(email).toLowerCase(), password_hash, 'merchant');
      const user = db.prepare('SELECT id, name, email, role FROM merchants WHERE id = ?').get(info.lastInsertRowid);
      const token = signToken(user);
      return res.json({ ok: true, token, user });
    } catch (e) {
      return next(e);
    }
  });

  router.post('/login', async (req, res, next) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) return res.status(400).json({ ok: false, error: 'Missing email/password' });
      const user = db.prepare('SELECT id, name, email, role, password_hash FROM merchants WHERE email = ?').get(
        String(email).toLowerCase()
      );
      if (!user) return res.status(401).json({ ok: false, error: 'Invalid credentials' });
      const ok = await bcrypt.compare(String(password), user.password_hash);
      if (!ok) return res.status(401).json({ ok: false, error: 'Invalid credentials' });
      const token = signToken(user);
      return res.json({ ok: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (e) {
      return next(e);
    }
  });

  // ARKO-LAB-08: insecure reset flow returns a token in JSON (no email verification).
  router.post('/reset', (req, res) => {
    const { email } = req.body || {};
    const user = db.prepare('SELECT id, name, email, role FROM merchants WHERE email = ?').get(String(email || '').toLowerCase());
    if (!user) return res.status(404).json({ ok: false, error: 'No such user' });
    const resetToken = signToken(user);
    return res.json({ ok: true, resetToken });
  });

  router.get('/me', requireAuth, (req, res) => {
    const user = db.prepare('SELECT id, name, email, role FROM merchants WHERE id = ?').get(req.user.sub);
    return res.json({ ok: true, user });
  });

  return router;
}

