import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { setAuth } from '../auth.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      setAuth(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="authWrap">
      <div className="authCard">
        <div className="authTitle">Create merchant account</div>
        <div className="muted" style={{ marginTop: 6 }}>
          Demo only. Fake data. Test cards only.
        </div>

        <form className="form" style={{ marginTop: 14 }} onSubmit={onSubmit}>
          <div className="formRow">
            <div className="label">Business name</div>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Co." />
          </div>
          <div className="formRow">
            <div className="label">Email</div>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@acme.test" />
          </div>
          <div className="formRow">
            <div className="label">Password</div>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a password" />
          </div>
          {error ? <div className="note" style={{ borderStyle: 'solid', borderColor: 'rgba(255,77,109,.35)' }}>{error}</div> : null}
          <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
          <div className="muted">
            Already have an account? <Link to="/login"><b>Log in</b></Link>
          </div>
        </form>
      </div>
    </div>
  );
}

