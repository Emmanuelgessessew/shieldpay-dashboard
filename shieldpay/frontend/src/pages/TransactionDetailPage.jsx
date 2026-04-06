import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';

function fmtMoney(cents) {
  return `$${(Number(cents || 0) / 100).toFixed(2)}`;
}

export default function TransactionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tx, setTx] = React.useState(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get(`/transactions/${id}`);
        if (mounted) setTx(data.transaction);
      } catch (e) {
        if (mounted) setError(e?.response?.data?.error || e.message);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <div>
      <div className="pageHeader">
        <div>
          <div className="pageTitle">Transaction #{id}</div>
          <div className="pageSub">Lab-only: this view leaks PAN/CVV in v1.</div>
        </div>
        <button className="btn btnGhost" onClick={() => navigate('/transactions')}>Back</button>
      </div>

      {error ? <div className="note">{error}</div> : null}

      {tx ? (
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>{fmtMoney(tx.amount_cents)} <span className="muted" style={{ fontWeight: 700 }}>{tx.currency}</span></div>
              <div className="muted">{new Date(tx.created_at).toLocaleString()}</div>
            </div>
            <div className={`pill ${tx.status === 'succeeded' ? 'ok' : tx.status === 'failed' ? 'bad' : 'warn'}`}>{tx.status}</div>
          </div>

          <div style={{ marginTop: 12 }} className="note">
            <div><b>Description</b>: {tx.description || '—'}</div>
            <div style={{ marginTop: 8 }}><b>Customer</b>: {tx.customer_name || '—'} <span className="muted">{tx.customer_email || ''}</span></div>
            <div style={{ marginTop: 8 }}><b>Card</b>: {tx.card_brand ? `${tx.card_brand} •••• ${tx.card_last4}` : '—'}</div>
            <div style={{ marginTop: 8 }}><b>PAN (unsafe)</b>: <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>{tx.card_pan || '—'}</span></div>
            <div style={{ marginTop: 8 }}><b>CVV (unsafe)</b>: <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>{tx.card_cvv || '—'}</span></div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

