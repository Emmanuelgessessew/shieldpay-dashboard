import React from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

function fmtMoney(cents) {
  return `$${(Number(cents || 0) / 100).toFixed(2)}`;
}

export default function DashboardPage() {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/stats');
        if (mounted) setData(res.data);
      } catch (e) {
        if (mounted) setError(e?.response?.data?.error || e.message);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const bars = data?.bars || [];
  const max = Math.max(1, ...bars.map((b) => Number(b.revenue_cents || 0)));

  return (
    <div>
      <div className="pageHeader">
        <div>
          <div className="pageTitle">Dashboard</div>
          <div className="pageSub">Multi-merchant payments demo (fake money).</div>
        </div>
        <div className="row">
          <Link className="btn" to="/payments/new">New payment</Link>
          <Link className="btn btnGhost" to="/transactions">View transactions</Link>
        </div>
      </div>

      {error ? <div className="note">{error}</div> : null}

      <div className="cards">
        <div className="card">
          <div className="cardLabel">Customers</div>
          <div className="cardValue">{data?.totals?.customers ?? '—'}</div>
        </div>
        <div className="card">
          <div className="cardLabel">Cards on file</div>
          <div className="cardValue">{data?.totals?.cards ?? '—'}</div>
        </div>
        <div className="card">
          <div className="cardLabel">Transactions</div>
          <div className="cardValue">{data?.totals?.transactions ?? '—'}</div>
        </div>
      </div>

      <div className="grid2" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 850 }}>Revenue (last 7 days)</div>
              <div className="pageSub">Succeeded payments only</div>
            </div>
            <div className="pill warn">Demo bars</div>
          </div>
          <div className="bars">
            {bars.map((b) => {
              const pct = Math.max(0.04, Number(b.revenue_cents || 0) / max);
              return (
                <div key={b.day} style={{ width: '100%' }}>
                  <div className="bar">
                    <div className="barFill" style={{ height: `${pct * 100}%` }} />
                  </div>
                  <div className="barLabel">{String(b.day).slice(5)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 850 }}>Recent</div>
              <div className="pageSub">Last 8 transactions</div>
            </div>
            <Link className="btn btnGhost" to="/transactions">All</Link>
          </div>

          <div style={{ marginTop: 10 }}>
            {(data?.recent || []).map((t) => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                <div>
                  <div style={{ fontWeight: 750 }}>{t.description || `Transaction #${t.id}`}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{new Date(t.created_at).toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 850 }}>{fmtMoney(t.amount_cents)}</div>
                  <div className={`pill ${t.status === 'succeeded' ? 'ok' : t.status === 'failed' ? 'bad' : 'warn'}`} style={{ marginTop: 6 }}>
                    {t.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

