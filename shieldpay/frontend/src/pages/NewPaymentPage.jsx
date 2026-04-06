import React from 'react';
import { api } from '../api.js';

function fmtMoney(cents) {
  return `$${(Number(cents || 0) / 100).toFixed(2)}`;
}

export default function NewPaymentPage() {
  const [customers, setCustomers] = React.useState([]);
  const [cards, setCards] = React.useState([]);
  const [form, setForm] = React.useState({
    customer_id: '',
    card_id: '',
    amount_cents: 1299,
    currency: 'USD',
    description: 'Demo payment'
  });
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [c, cd] = await Promise.all([api.get('/customers'), api.get('/cards')]);
        if (!mounted) return;
        setCustomers(c.data.customers || []);
        setCards(cd.data.cards || []);
        const firstCustomer = (c.data.customers || [])[0];
        const firstCard = (cd.data.cards || [])[0];
        setForm((f) => ({
          ...f,
          customer_id: firstCustomer ? String(firstCustomer.id) : '',
          card_id: firstCard ? String(firstCard.id) : ''
        }));
      } catch (e) {
        if (mounted) setError(e?.response?.data?.error || e.message);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const payload = {
        customer_id: form.customer_id ? Number(form.customer_id) : null,
        card_id: form.card_id ? Number(form.card_id) : null,
        amount_cents: Number(form.amount_cents),
        currency: form.currency,
        description: form.description
      };
      const { data } = await api.post('/payments/process', payload);
      setResult(data.transaction);
    } catch (e2) {
      setError(e2?.response?.data?.error || e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="pageHeader">
        <div>
          <div className="pageTitle">New payment</div>
          <div className="pageSub">Fake processing: even amounts succeed, odd amounts fail.</div>
        </div>
      </div>

      {error ? <div className="note">{error}</div> : null}

      <div className="grid2">
        <div className="card">
          <form className="form" onSubmit={onSubmit}>
            <div className="formRow">
              <div className="label">Customer</div>
              <select className="select" value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
                {customers.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    #{c.id} · {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="formRow">
              <div className="label">Card</div>
              <select className="select" value={form.card_id} onChange={(e) => setForm({ ...form, card_id: e.target.value })}>
                {cards.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    #{c.id} · {c.brand} •••• {c.last4}
                  </option>
                ))}
              </select>
            </div>

            <div className="formRow">
              <div className="label">Amount (cents)</div>
              <input className="input" type="number" value={form.amount_cents} onChange={(e) => setForm({ ...form, amount_cents: e.target.value })} />
              <div className="muted" style={{ fontSize: 12 }}>Preview: {fmtMoney(form.amount_cents)}</div>
            </div>

            <div className="formRow">
              <div className="label">Description</div>
              <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <button className="btn" disabled={busy}>{busy ? 'Processing…' : 'Process payment'}</button>
          </form>
        </div>

        <div className="card">
          <div style={{ fontWeight: 850 }}>Result</div>
          <div className="pageSub">Saved to your merchant transactions.</div>
          {result ? (
            <div className="note" style={{ marginTop: 12 }}>
              <div><b>ID</b>: #{result.id}</div>
              <div style={{ marginTop: 8 }}><b>Status</b>: {result.status}</div>
              <div style={{ marginTop: 8 }}><b>Amount</b>: {fmtMoney(result.amount_cents)} {result.currency}</div>
              <div style={{ marginTop: 8 }}><b>Created</b>: {new Date(result.created_at).toLocaleString()}</div>
            </div>
          ) : (
            <div className="note" style={{ marginTop: 12 }}>Run a payment to see the created transaction.</div>
          )}
        </div>
      </div>
    </div>
  );
}

