import React from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

function fmtMoney(cents) {
  return `$${(Number(cents || 0) / 100).toFixed(2)}`;
}

export default function TransactionsPage() {
  const navigate = useNavigate();
  const [tx, setTx] = React.useState([]);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/transactions');
        if (mounted) setTx(data.transactions || []);
      } catch (e) {
        if (mounted) setError(e?.response?.data?.error || e.message);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <div className="pageHeader">
        <div>
          <div className="pageTitle">Transactions</div>
          <div className="pageSub">Click a transaction for details.</div>
        </div>
      </div>

      {error ? <div className="note">{error}</div> : null}

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>When</th>
            <th>Customer</th>
            <th>Card</th>
            <th>Amount</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {tx.map((t) => (
            <tr key={t.id}>
              <td>#{t.id}</td>
              <td className="muted">{new Date(t.created_at).toLocaleString()}</td>
              <td>{t.customer_name || (t.customer_id ? `#${t.customer_id}` : '—')}</td>
              <td className="muted">{t.card_brand ? `${t.card_brand} •••• ${t.card_last4}` : (t.card_id ? `#${t.card_id}` : '—')}</td>
              <td style={{ fontWeight: 850 }}>{fmtMoney(t.amount_cents)}</td>
              <td>
                <span className={`pill ${t.status === 'succeeded' ? 'ok' : t.status === 'failed' ? 'bad' : 'warn'}`}>
                  {t.status}
                </span>
              </td>
              <td style={{ textAlign: 'right' }}>
                <button className="btn btnGhost" onClick={() => navigate(`/transactions/${t.id}`)}>View</button>
              </td>
            </tr>
          ))}
          {tx.length === 0 ? (
            <tr><td colSpan={7} className="muted">No transactions found.</td></tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

