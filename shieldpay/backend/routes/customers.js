import express from 'express';
import { requireAuth } from '../auth.js';

export function customerRoutes(db) {
  const router = express.Router();
  router.use(requireAuth);

  router.get('/', (req, res, next) => {
    try {
      const merchantId = Number(req.user.sub);
      const search = String(req.query.search || '').trim();

      if (search) {
        // ARKO-LAB-01 (fixed): use bound parameters (no string concatenation).
        const q = `%${search}%`;
        const rows = db
          .prepare(
            `SELECT id, merchant_id, name, email, phone, created_at
             FROM customers
             WHERE merchant_id = ? AND (name LIKE ? OR email LIKE ?)
             ORDER BY id DESC
             LIMIT 100`
          )
          .all(merchantId, q, q);
        return res.json({ ok: true, customers: rows });
      }

      const rows = db
        .prepare('SELECT id, merchant_id, name, email, phone, created_at FROM customers WHERE merchant_id = ? ORDER BY id DESC LIMIT 100')
        .all(merchantId);
      return res.json({ ok: true, customers: rows });
    } catch (e) {
      return next(e);
    }
  });

  router.get('/:id', (req, res, next) => {
    try {
      const merchantId = Number(req.user.sub);
      const id = Number(req.params.id);
      const customer = db
        .prepare('SELECT id, merchant_id, name, email, phone, created_at FROM customers WHERE id = ? AND merchant_id = ?')
        .get(id, merchantId);
      if (!customer) return res.status(404).json({ ok: false, error: 'Not found' });
      return res.json({ ok: true, customer });
    } catch (e) {
      return next(e);
    }
  });

  router.post('/', (req, res, next) => {
    try {
      const merchantId = Number(req.user.sub);
      const { name, email, phone } = req.body || {};
      if (!name || !email) return res.status(400).json({ ok: false, error: 'Missing name/email' });
      const info = db
        .prepare('INSERT INTO customers (merchant_id, name, email, phone) VALUES (?, ?, ?, ?)')
        .run(merchantId, String(name), String(email), phone ? String(phone) : null);
      const customer = db
        .prepare('SELECT id, merchant_id, name, email, phone, created_at FROM customers WHERE id = ?')
        .get(info.lastInsertRowid);
      return res.json({ ok: true, customer });
    } catch (e) {
      return next(e);
    }
  });

  // ARKO-LAB-02: Broken access control - update by ID only, no ownership check vs merchant_id.
  router.put('/:id', (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const { name, email, phone } = req.body || {};
      db.prepare('UPDATE customers SET name = COALESCE(?, name), email = COALESCE(?, email), phone = COALESCE(?, phone) WHERE id = ?').run(
        name != null ? String(name) : null,
        email != null ? String(email) : null,
        phone != null ? String(phone) : null,
        id
      );
      const customer = db.prepare('SELECT id, merchant_id, name, email, phone, created_at FROM customers WHERE id = ?').get(id);
      if (!customer) return res.status(404).json({ ok: false, error: 'Not found' });
      return res.json({ ok: true, customer });
    } catch (e) {
      return next(e);
    }
  });

  // ARKO-LAB-02: Broken access control - delete by ID only, no ownership check vs merchant_id.
  router.delete('/:id', (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const info = db.prepare('DELETE FROM customers WHERE id = ?').run(id);
      return res.json({ ok: true, deleted: info.changes });
    } catch (e) {
      return next(e);
    }
  });

  return router;
}

