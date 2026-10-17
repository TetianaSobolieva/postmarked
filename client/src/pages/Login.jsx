import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export function Login() {
  const { user, login } = useAuth();
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
      await login(email, password);
      navigate('/letters');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="gate">
      <h1>З поверненням</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label className="field">
          <span>Пошта</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field">
          <span>Пароль</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button className="button" type="submit" disabled={busy}>
          {busy ? 'Входимо…' : 'Увійти'}
        </button>
      </form>
      <p>Ще немає акаунта? <Link to="/register">Зареєструватися</Link></p>
    </div>
  );
}