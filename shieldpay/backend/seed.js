import bcrypt from 'bcrypt';

function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function genApiKeySecret() {
  // Not cryptographically strong; demo only.
  return `sk_test_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

export async function seedIfEmpty(db, env) {
  const hasAny = db.prepare('SELECT COUNT(*) AS n FROM merchants').get().n > 0;
  if (hasAny) return;

  const adminEmail = env.ADMIN_EMAIL || 'admin@shieldpay.local';
  const adminPassword = env.ADMIN_PASSWORD || 'Admin1234!';

  const demoMerchantEmail = 'merchant@demo.com';
  const demoMerchantPassword = 'Demo1234!';

  const insertMerchant = db.prepare(
    'INSERT INTO merchants (name, email, password_hash, role) VALUES (@name, @email, @password_hash, @role)'
  );

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const demoHash = await bcrypt.hash(demoMerchantPassword, 10);

  const admin = insertMerchant.run({
    name: 'ShieldPay Admin',
    email: adminEmail,
    password_hash: adminHash,
    role: 'admin'
  });

  const demo = insertMerchant.run({
    name: 'Demo Merchant',
    email: demoMerchantEmail,
    password_hash: demoHash,
    role: 'merchant'
  });

  const demoMerchantId = Number(demo.lastInsertRowid);

  const insertCustomer = db.prepare(
    'INSERT INTO customers (merchant_id, name, email, phone) VALUES (@merchant_id, @name, @email, @phone)'
  );
  const insertCard = db.prepare(
    `INSERT INTO cards
      (merchant_id, customer_id, brand, last4, exp_month, exp_year, pan, cvv)
     VALUES (@merchant_id, @customer_id, @brand, @last4, @exp_month, @exp_year, @pan, @cvv)`
  );
  const insertTx = db.prepare(
    `INSERT INTO transactions
      (merchant_id, customer_id, card_id, amount_cents, currency, status, description, created_at)
     VALUES (@merchant_id, @customer_id, @card_id, @amount_cents, @currency, @status, @description, @created_at)`
  );

  const customers = [
    { name: 'Avery Johnson', email: 'avery@example.com', phone: '+1 (555) 010-2001' },
    { name: 'Morgan Lee', email: 'morgan@example.com', phone: '+1 (555) 010-2002' },
    { name: 'Riley Patel', email: 'riley@example.com', phone: '+1 (555) 010-2003' },
    { name: 'Jordan Kim', email: 'jordan@example.com', phone: '+1 (555) 010-2004' }
  ];

  // Test card numbers ONLY (lab + demo). Never store/collect real PANs.
  // ARKO-LAB-09: Store full test PAN + CVV in plaintext in SQLite (lab-only / illegal in production).
  const testCards = [
    { brand: 'VISA', pan: '4111111111111111', cvv: '123', exp_month: 12, exp_year: 2030 },
    { brand: 'MASTERCARD', pan: '5555555555554444', cvv: '456', exp_month: 1, exp_year: 2031 },
    { brand: 'AMEX', pan: '378282246310005', cvv: '1234', exp_month: 10, exp_year: 2030 },
    { brand: 'DISCOVER', pan: '6011111111111117', cvv: '321', exp_month: 6, exp_year: 2032 }
  ];

  const insertedCustomerIds = [];
  for (const c of customers) {
    const res = insertCustomer.run({ merchant_id: demoMerchantId, ...c });
    insertedCustomerIds.push(Number(res.lastInsertRowid));
  }

  const insertedCardIds = [];
  for (let i = 0; i < insertedCustomerIds.length; i++) {
    const cid = insertedCustomerIds[i];
    const card = testCards[i % testCards.length];
    const last4 = card.pan.slice(-4);
    const res = insertCard.run({
      merchant_id: demoMerchantId,
      customer_id: cid,
      brand: card.brand,
      last4,
      exp_month: card.exp_month,
      exp_year: card.exp_year,
      pan: card.pan,
      cvv: card.cvv
    });
    insertedCardIds.push(Number(res.lastInsertRowid));
  }

  const statuses = ['succeeded', 'failed', 'pending'];
  const now = Date.now();
  for (let i = 0; i < 24; i++) {
    const daysAgo = Math.floor(i / 3);
    const createdAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000 - (i % 7) * 3600 * 1000).toISOString();
    const customer_id = randChoice(insertedCustomerIds);
    const card_id = insertedCardIds[insertedCustomerIds.indexOf(customer_id)];
    const amount_cents = randChoice([1299, 2599, 4999, 1099, 7999, 1599]);
    insertTx.run({
      merchant_id: demoMerchantId,
      customer_id,
      card_id,
      amount_cents,
      currency: 'USD',
      status: statuses[i % statuses.length],
      description: randChoice(['Demo order', 'Subscription', 'Top-up', 'Invoice #SP-10' + i]),
      created_at: createdAt
    });
  }

  db.prepare('INSERT INTO api_keys (merchant_id, label, secret) VALUES (?, ?, ?)').run(
    demoMerchantId,
    'Default test key',
    genApiKeySecret()
  );
  db.prepare('INSERT INTO webhooks (merchant_id, url, event_type) VALUES (?, ?, ?)').run(
    demoMerchantId,
    'https://example.com/webhooks/shieldpay',
    'payment.succeeded'
  );

  console.log('Seeded ShieldPay DB:', {
    admin: { email: adminEmail, password: adminPassword },
    demoMerchant: { email: demoMerchantEmail, password: demoMerchantPassword }
  });
  void admin; // avoid unused lint in some setups
}

