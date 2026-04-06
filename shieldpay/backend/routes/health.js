import express from 'express';

export function healthRoutes(db) {
  const router = express.Router();
  router.get('/health', (req, res) => {
    const now = new Date().toISOString();
    const merchants = db.prepare('SELECT COUNT(*) AS n FROM merchants').get().n;
    return res.json({ ok: true, now, merchants });
  });
  return router;
}

