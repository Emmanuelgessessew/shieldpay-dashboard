import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = React.useState(null);
  const [form, setForm] = React.useState({ name: '', email: '', phone: '' });
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const load = async () => {
    setError('');
    try {
      const { data } = await api.get(`/customers/${id}`);
      setCustomer(data.customer);
      setForm({ name: data.customer.name || '', email: data.customer.email || '', phone: data.customer.phone || '' });
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    }
  };

  React.useEffect(() => {
    void load();
  }, [id]);

  const onSave = async () => {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.put(`/customers/${id}`, form);
      setCustomer(data.customer);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!confirm('Delete this customer?')) return;
    setBusy(true);
    setError('');
    try {
      await api.delete(`/customers/${id}`);
      navigate('/customers');
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="pageHeader">
        <div>
          <div className="pageTitle">Customer #{id}</div>
          <div className="pageSub">Edit + delete are intentionally weak in v1 (lab).</div>
        </div>
        <div className="row">
          <button className="btn btnGhost" onClick={() => navigate('/customers')}>Back</button>
        </div>
      </div>

      {error ? <div className="note">{error}</div> : null}

      <div className="card">
        <div className="form">
          <div className="formRow">
            <div className="label">Name</div>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="formRow">
            <div className="label">Email</div>
            <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="formRow">
            <div className="label">Phone</div>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="row">
            <button className="btn" onClick={onSave} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
            <button className="btn btnDanger" onClick={onDelete} disabled={busy}>Delete</button>
          </div>
        </div>
      </div>

      {customer ? (
        <div className="note" style={{ marginTop: 12 }}>
          Created: <b>{new Date(customer.created_at).toLocaleString()}</b>
        </div>
      ) : null}
    </div>
  );
}

