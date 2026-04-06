import express from 'express';
import { requireAdmin, requireAuth } from '../auth.js';

export function adminRoutes(db) {
  const router = express.Router();
  router.use(requireAuth);
  router.use(requireAdmin);

  // ARKO-LAB-03: FIXED - admin APIs now require role === 'admin'.
  router.get('/merchants', (req, res, next) => {
    try {
      const rows = db.prepare('SELECT id, name, email, role, created_at FROM merchants ORDER BY id ASC').all();
      return res.json({ ok: true, merchants: rows });
    } catch (e) {
      return next(e);
    }
  });

  // ARKO-LAB-03: FIXED - admin role gate enforced.
  router.get('/stats', (req, res, next) => {
    try {
      const merchants = db.prepare('SELECT COUNT(*) AS n FROM merchants').get().n;
      const customers = db.prepare('SELECT COUNT(*) AS n FROM customers').get().n;
      const tx = db.prepare('SELECT COUNT(*) AS n FROM transactions').get().n;
      return res.json({ ok: true, totals: { merchants, customers, transactions: tx } });
    } catch (e) {
      return next(e);
    }
  });

  return router;
}

