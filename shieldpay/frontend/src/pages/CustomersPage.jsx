import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [error, setError] = React.useState('');

  const load = async (q) => {
    setError('');
    try {
      const { data } = await api.get('/customers', { params: q ? { search: q } : {} });
      setCustomers(data.customers || []);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    }
  };

  React.useEffect(() => {
    void load('');
  }, []);

  return (
    <div>
      <div className="pageHeader">
        <div>
          <div className="pageTitle">Customers</div>
          <div className="pageSub">Search is intentionally vulnerable in v1 (lab).</div>
        </div>
        <div className="row" style={{ minWidth: 320 }}>
          <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email" />
          <button className="btn btnGhost" onClick={() => load(search)}>Search</button>
        </div>
      </div>

      {error ? <div className="note">{error}</div> : null}

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>#{c.id}</td>
              <td>{c.name}</td>
              <td className="muted">{c.email}</td>
              <td className="muted">{c.phone || '—'}</td>
              <td style={{ textAlign: 'right' }}>
                <button className="btn btnGhost" onClick={() => navigate(`/customers/${c.id}`)}>View</button>
              </td>
            </tr>
          ))}
          {customers.length === 0 ? (
            <tr>
              <td colSpan={5} className="muted">No customers found.</td>
            </tr>
          ) : null}
        </tbody>
      </table>

      <div style={{ marginTop: 12 }} className="note">
        Tip: Try <b>merchant@demo.com</b> seeded data. You can also create customers via API later.
        {' '}<Link to="/settings"><b>Settings</b></Link>
      </div>
    </div>
  );
}

