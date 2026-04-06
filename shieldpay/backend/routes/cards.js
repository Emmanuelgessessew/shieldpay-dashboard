import express from 'express';
import { requireAuth } from '../auth.js';

export function cardRoutes(db) {
  const router = express.Router();
  router.use(requireAuth);

  router.get('/', (req, res, next) => {
    try {
      const merchantId = Number(req.user.sub);
      const rows = db
        .prepare(
          `SELECT id, merchant_id, customer_id, brand, last4, exp_month, exp_year, pan, cvv, created_at
           FROM cards WHERE merchant_id = ? ORDER BY id DESC LIMIT 200`
        )
        .all(merchantId);

      // ARKO-LAB-04: Return full PAN/CVV in API response (unsafe; demo data only).
      return res.json({ ok: true, cards: rows, unsafe: true });
    } catch (e) {
      return next(e);
    }
  });

  router.get('/:id', (req, res, next) => {
    try {
      const merchantId = Number(req.user.sub);
      const id = Number(req.params.id);
      const card = db
        .prepare(
          `SELECT id, merchant_id, customer_id, brand, last4, exp_month, exp_year, pan, cvv, created_at
           FROM cards WHERE id = ? AND merchant_id = ?`
        )
        .get(id, merchantId);
      if (!card) return res.status(404).json({ ok: false, error: 'Not found' });
      // ARKO-LAB-04: Return full PAN/CVV in API response (unsafe; demo data only).
      return res.json({ ok: true, card, unsafe: true });
    } catch (e) {
      return next(e);
    }
  });

  router.post('/', (req, res, next) => {
    try {
      const merchantId = Number(req.user.sub);
      const { customer_id, brand, pan, cvv, exp_month, exp_year } = req.body || {};
      if (!customer_id || !brand || !pan || !cvv || !exp_month || !exp_year) {
        return res.status(400).json({ ok: false, error: 'Missing fields' });
      }
      const last4 = String(pan).slice(-4);
      const info = db
        .prepare(
          `INSERT INTO cards (merchant_id, customer_id, brand, last4, exp_month, exp_year, pan, cvv)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          merchantId,
          Number(customer_id),
          String(brand),
          String(last4),
          Number(exp_month),
          Number(exp_year),
          String(pan),
          String(cvv)
        );
      const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(info.lastInsertRowid);
      return res.json({ ok: true, card });
    } catch (e) {
      return next(e);
    }
  });

  return router;
}

