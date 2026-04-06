import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { setAuth } from '../auth.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('merchant@demo.com');
  const [password, setPassword] = React.useState('Demo1234!');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
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
        <div className="authTitle">ShieldPay</div>
        <div className="muted" style={{ marginTop: 6 }}>
          Log in with the seeded demo merchant.
        </div>
        <div className="note" style={{ marginTop: 12 }}>
          Demo merchant: <b>merchant@demo.com</b> / <b>Demo1234!</b>
        </div>

        <form className="form" style={{ marginTop: 14 }} onSubmit={onSubmit}>
          <div className="formRow">
            <div className="label">Email</div>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="formRow">
            <div className="label">Password</div>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error ? <div className="note" style={{ borderStyle: 'solid', borderColor: 'rgba(255,77,109,.35)' }}>{error}</div> : null}
          <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
          <div className="muted">
            Need an account? <Link to="/register"><b>Register</b></Link>
          </div>
        </form>
      </div>
    </div>
  );
}

