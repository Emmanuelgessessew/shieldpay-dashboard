import React from 'react';
import { api } from '../api.js';
import { getUser, setAuth } from '../auth.js';

export default function SettingsPage() {
  const user = getUser();
  const [profile, setProfile] = React.useState(user);
  const [keys, setKeys] = React.useState([]);
  const [webhooks, setWebhooks] = React.useState([]);
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const load = async () => {
    setError('');
    try {
      const [p, k, w] = await Promise.all([
        api.get('/settings/profile'),
        api.get('/settings/api-keys'),
        api.get('/settings/webhooks')
      ]);
      setProfile(p.data.profile);
      setKeys(k.data.keys || []);
      setWebhooks(w.data.webhooks || []);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    }
  };

  React.useEffect(() => {
    void load();
  }, []);

  const onSave = async () => {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/settings/profile', { name: profile?.name || '' });
      setProfile(data.profile);
      setAuth(localStorage.getItem('shieldpay_token'), data.profile);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  const onExport = async () => {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.get('/settings/export');
      const blob = new Blob([JSON.stringify(data.export, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'shieldpay-export.json';
      a.click();
      URL.revokeObjectURL(url);
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
          <div className="pageTitle">Settings</div>
          <div className="pageSub">Profile, API keys, export, and webhooks.</div>
        </div>
        <div className="row">
          <button className="btn btnGhost" onClick={onExport} disabled={busy}>Export JSON</button>
          <button className="btn" onClick={onSave} disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
        </div>
      </div>

      {error ? <div className="note">{error}</div> : null}

      <div className="grid2">
        <div className="card">
          <div style={{ fontWeight: 850, marginBottom: 10 }}>Profile</div>
          <div className="form">
            <div className="formRow">
              <div className="label">Name</div>
              <input className="input" value={profile?.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div className="formRow">
              <div className="label">Email</div>
              <input className="input" value={profile?.email || ''} disabled />
            </div>
            <div className="formRow">
              <div className="label">Role</div>
              <input className="input" value={profile?.role || ''} disabled />
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 850, marginBottom: 10 }}>API keys</div>
          <table className="table">
            <thead>
              <tr>
                <th>Label</th>
                <th>Secret</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id}>
                  <td>{k.label}</td>
                  <td style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>{k.secret}</td>
                </tr>
              ))}
              {keys.length === 0 ? <tr><td colSpan={2} className="muted">No keys.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div style={{ fontWeight: 850, marginBottom: 10 }}>Webhooks</div>
        <table className="table">
          <thead>
            <tr>
              <th>URL</th>
              <th>Event</th>
            </tr>
          </thead>
          <tbody>
            {webhooks.map((w) => (
              <tr key={w.id}>
                <td className="muted">{w.url}</td>
                <td>{w.event_type}</td>
              </tr>
            ))}
            {webhooks.length === 0 ? <tr><td colSpan={2} className="muted">No webhooks.</td></tr> : null}
          </tbody>
        </table>
        <div className="note" style={{ marginTop: 12 }}>
          Export includes cards + transactions, and is intentionally unsafe in v1 for the lab.
        </div>
      </div>
    </div>
  );
}

