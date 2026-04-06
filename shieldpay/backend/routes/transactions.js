import express from 'express';
import { requireAuth } from '../auth.js';

export function transactionRoutes(db) {
  const router = express.Router();
  router.use(requireAuth);

  router.get('/', (req, res, next) => {
    try {
      const merchantId = Number(req.user.sub);
      const rows = db
        .prepare(
          `SELECT t.id, t.merchant_id, t.customer_id, t.card_id, t.amount_cents, t.currency, t.status, t.description, t.created_at,
                  c.name AS customer_name,
                  cd.brand AS card_brand, cd.last4 AS card_last4
           FROM transactions t
           LEFT JOIN customers c ON c.id = t.customer_id
           LEFT JOIN cards cd ON cd.id = t.card_id
           WHERE t.merchant_id = ?
           ORDER BY datetime(t.created_at) DESC
           LIMIT 200`
        )
        .all(merchantId);
      return res.json({ ok: true, transactions: rows });
    } catch (e) {
      return next(e);
    }
  });

  router.get('/:id', (req, res, next) => {
    try {
      const merchantId = Number(req.user.sub);
      const id = Number(req.params.id);
      const tx = db
        .prepare(
          `SELECT t.*,
                  c.name AS customer_name, c.email AS customer_email,
                  cd.brand AS card_brand, cd.last4 AS card_last4, cd.pan AS card_pan, cd.cvv AS card_cvv
           FROM transactions t
           LEFT JOIN customers c ON c.id = t.customer_id
           LEFT JOIN cards cd ON cd.id = t.card_id
           WHERE t.id = ? AND t.merchant_id = ?`
        )
        .get(id, merchantId);
      if (!tx) return res.status(404).json({ ok: false, error: 'Not found' });
      // ARKO-LAB-04: Return full PAN/CVV in transaction detail (unsafe; demo only).
      return res.json({ ok: true, transaction: tx, unsafe: true });
    } catch (e) {
      return next(e);
    }
  });

  return router;
}

