import express from 'express';
import { requireAuth } from '../auth.js';

export function statsRoutes(db) {
  const router = express.Router();
  router.use(requireAuth);

  router.get('/', (req, res, next) => {
    try {
      const merchantId = Number(req.user.sub);
      const totals = db
        .prepare(
          `SELECT
             (SELECT COUNT(*) FROM customers WHERE merchant_id = ?) AS customers,
             (SELECT COUNT(*) FROM cards WHERE merchant_id = ?) AS cards,
             (SELECT COUNT(*) FROM transactions WHERE merchant_id = ?) AS transactions
          `
        )
        .get(merchantId, merchantId, merchantId);

      const recent = db
        .prepare(
          `SELECT id, amount_cents, currency, status, description, created_at
           FROM transactions
           WHERE merchant_id = ?
           ORDER BY datetime(created_at) DESC
           LIMIT 8`
        )
        .all(merchantId);

      const bars = db
        .prepare(
          `WITH RECURSIVE days(d) AS (
             SELECT date('now','-6 day')
             UNION ALL
             SELECT date(d,'+1 day') FROM days WHERE d < date('now')
           )
           SELECT d AS day,
                  COALESCE(SUM(CASE WHEN status='succeeded' THEN amount_cents ELSE 0 END), 0) AS revenue_cents
           FROM days
           LEFT JOIN transactions t
             ON date(t.created_at) = d AND t.merchant_id = ?
           GROUP BY d
           ORDER BY d ASC`
        )
        .all(merchantId);

      return res.json({ ok: true, totals, recent, bars });
    } catch (e) {
      return next(e);
    }
  });

  return router;
}

