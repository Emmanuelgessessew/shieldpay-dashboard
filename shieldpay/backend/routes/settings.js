import express from 'express';
import { requireAuth } from '../auth.js';

export function settingsRoutes(db) {
  const router = express.Router();
  router.use(requireAuth);

  router.get('/profile', (req, res, next) => {
    try {
      const user = db.prepare('SELECT id, name, email, role, created_at FROM merchants WHERE id = ?').get(req.user.sub);
      return res.json({ ok: true, profile: user });
    } catch (e) {
      return next(e);
    }
  });

  router.post('/profile', (req, res, next) => {
    try {
      const { name } = req.body || {};
      db.prepare('UPDATE merchants SET name = COALESCE(?, name) WHERE id = ?').run(name != null ? String(name) : null, req.user.sub);
      const user = db.prepare('SELECT id, name, email, role, created_at FROM merchants WHERE id = ?').get(req.user.sub);
      return res.json({ ok: true, profile: user });
    } catch (e) {
      return next(e);
    }
  });

  router.get('/api-keys', (req, res, next) => {
    try {
      const rows = db.prepare('SELECT id, label, secret, created_at FROM api_keys WHERE merchant_id = ? ORDER BY id DESC').all(req.user.sub);
      return res.json({ ok: true, keys: rows });
    } catch (e) {
      return next(e);
    }
  });

  router.get('/webhooks', (req, res, next) => {
    try {
      const rows = db.prepare('SELECT id, url, event_type, created_at FROM webhooks WHERE merchant_id = ? ORDER BY id DESC').all(req.user.sub);
      return res.json({ ok: true, webhooks: rows });
    } catch (e) {
      return next(e);
    }
  });

  router.get('/export', (req, res, next) => {
    try {
      const merchantId = Number(req.user.sub);
      const customers = db.prepare('SELECT * FROM customers WHERE merchant_id = ?').all(merchantId);
      const cards = db.prepare('SELECT * FROM cards WHERE merchant_id = ?').all(merchantId);
      const transactions = db.prepare('SELECT * FROM transactions WHERE merchant_id = ?').all(merchantId);
      return res.json({ ok: true, export: { customers, cards, transactions }, unsafe: true });
    } catch (e) {
      return next(e);
    }
  });

  return router;
}

