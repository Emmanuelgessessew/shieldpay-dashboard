import express from 'express';
import { requireAuth } from '../auth.js';

export function paymentRoutes(db) {
  const router = express.Router();
  router.use(requireAuth);

  router.post('/process', (req, res, next) => {
    try {
      const merchantId = Number(req.user.sub);
      const { customer_id, card_id, amount_cents, currency, description } = req.body || {};
      if (!amount_cents) return res.status(400).json({ ok: false, error: 'Missing amount_cents' });

      const cents = Number(amount_cents);
      const status = cents % 2 === 0 ? 'succeeded' : 'failed';

      const info = db
        .prepare(
          `INSERT INTO transactions (merchant_id, customer_id, card_id, amount_cents, currency, status, description, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          merchantId,
          customer_id ? Number(customer_id) : null,
          card_id ? Number(card_id) : null,
          cents,
          String(currency || 'USD'),
          status,
          description ? String(description) : null,
          new Date().toISOString()
        );

      const tx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(info.lastInsertRowid);
      return res.json({ ok: true, transaction: tx });
    } catch (e) {
      return next(e);
    }
  });

  return router;
}

