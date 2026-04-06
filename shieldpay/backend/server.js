import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import morgan from 'morgan';
import { createServer as createViteServer } from 'vite';

import { loadEnvFile } from './env.js';
import { openDb, initSchema } from './db.js';
import { seedIfEmpty } from './seed.js';

import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { customerRoutes } from './routes/customers.js';
import { cardRoutes } from './routes/cards.js';
import { transactionRoutes } from './routes/transactions.js';
import { paymentRoutes } from './routes/payments.js';
import { adminRoutes } from './routes/admin.js';
import { settingsRoutes } from './routes/settings.js';
import { statsRoutes } from './routes/stats.js';

loadEnvFile(path.resolve(process.cwd(), '.env'));

const PORT = Number(process.env.PORT || 8788);
const DATABASE_PATH = process.env.DATABASE_PATH || './backend/data/shieldpay.db';

const app = express();
app.disable('x-powered-by');

app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-session-secret',
    resave: false,
    saveUninitialized: true
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));

// ARKO-LAB-05: Log full request bodies including passwords/card data (unsafe).
app.use((req, res, next) => {
  console.log('REQ', {
    method: req.method,
    path: req.path,
    body: req.body
  });
  next();
});

const db = openDb(DATABASE_PATH);
initSchema(db);
await seedIfEmpty(db, process.env);

// Express mounts all /api/* routes first.
app.use('/api', healthRoutes(db));
app.use('/api/auth', authRoutes(db));
app.use('/api/customers', customerRoutes(db));
app.use('/api/cards', cardRoutes(db));
app.use('/api/transactions', transactionRoutes(db));
app.use('/api/payments', paymentRoutes(db));
app.use('/api/admin', adminRoutes(db));
app.use('/api/settings', settingsRoutes(db));
app.use('/api/stats', statsRoutes(db));

if (process.env.NODE_ENV === 'production') {
  const distDir = path.resolve(process.cwd(), 'frontend', 'dist');
  const indexHtml = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexHtml)) {
    console.error(
      `Missing production build at ${distDir}. Run "npm run build" first.`
    );
    process.exit(1);
  }
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    res.sendFile(indexHtml);
  });
} else {
  // Attach Vite in middleware mode (single Node process).
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);
}

// ARKO-LAB-06: Global error handler returns stack trace (and req.body) in JSON in all environments.
app.use((err, req, res, next) => {
  const status = err?.statusCode || err?.status || 500;
  res.status(status).json({
    ok: false,
    error: err?.message || 'Server error',
    stack: err?.stack,
    body: req.body
  });
});

function listenWithFallback(startPort, maxTries = 20) {
  let port = startPort;

  const tryListen = () => {
    const server = app.listen(port, '127.0.0.1', () => {
      console.log(`ShieldPay running: http://127.0.0.1:${port}`);
    });

    server.on('error', (err) => {
      if (err?.code === 'EADDRINUSE' && port < startPort + maxTries) {
        console.warn(`Port ${port} in use, trying ${port + 1}...`);
        port += 1;
        tryListen();
        return;
      }
      console.error('Failed to start server:', err);
      process.exit(1);
    });
  };

  tryListen();
}

listenWithFallback(PORT);

