import React from 'react';
import { api } from '../api.js';
import { getUser } from '../auth.js';

export default function AdminPage() {
  const user = getUser();
  const [merchants, setMerchants] = React.useState([]);
  const [totals, setTotals] = React.useState(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [m, s] = await Promise.all([api.get('/admin/merchants'), api.get('/admin/stats')]);
        if (!mounted) return;
        setMerchants(m.data.merchants || []);
        setTotals(s.data.totals || null);
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
          <div className="pageTitle">Admin</div>
          <div className="pageSub">Lab-only: role checks are missing for these endpoints in v1.</div>
        </div>
        <div className={`pill ${user?.role === 'admin' ? 'ok' : 'warn'}`}>
          You are: {user?.role || 'unknown'}
        </div>
      </div>

      {error ? <div className="note">{error}</div> : null}

      <div className="cards">
        <div className="card">
          <div className="cardLabel">Merchants</div>
          <div className="cardValue">{totals?.merchants ?? '—'}</div>
        </div>
        <div className="card">
          <div className="cardLabel">Customers (all)</div>
          <div className="cardValue">{totals?.customers ?? '—'}</div>
        </div>
        <div className="card">
          <div className="cardLabel">Transactions (all)</div>
          <div className="cardValue">{totals?.transactions ?? '—'}</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div style={{ fontWeight: 850, marginBottom: 10 }}>Merchants list</div>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {merchants.map((m) => (
              <tr key={m.id}>
                <td>#{m.id}</td>
                <td>{m.name}</td>
                <td className="muted">{m.email}</td>
                <td>{m.role}</td>
                <td className="muted">{new Date(m.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {merchants.length === 0 ? <tr><td colSpan={5} className="muted">No data.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

