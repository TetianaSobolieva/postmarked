import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/letters" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(email, password);
      navigate('/letters');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="gate">
      <h1>Заведи скриньку</h1>
      <p className="lede">
        На цю адресу прилетять твої листи — тож вкажи ту пошту, яку справді читаєш.
      </p>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <label className="field">
          <span>Пошта</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="field">
          <span>Пароль</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
          <p className="hint">Щонайменше 8 символів.</p>
        </label>

        <button className="button" type="submit" disabled={busy}>
          {busy ? 'Створюємо…' : 'Створити акаунт'}
        </button>
      </form>

      <p className="switch">
        Вже маєш акаунт? <Link to="/login">Увійти</Link>
      </p>
    </div>
  );
}
