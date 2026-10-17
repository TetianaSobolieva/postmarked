import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Letters } from './pages/Letters.jsx';
import { Compose } from './pages/Compose.jsx';
import { LetterView } from './pages/LetterView.jsx';

function Masthead() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="masthead">
      <Link className="wordmark" to={user ? '/letters' : '/login'}>Postmarked</Link>
      <nav>
        {user ? (
          <>
            <span>{user.email}</span>
            <Link className="button" to="/write">Написати листа</Link>
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
            >
              Вийти
            </button>
          </>
        ) : (
          <Link to="/login">Увійти</Link>
        )}
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <div className="shell">
      <Masthead />
      <Routes>
        <Route path="/" element={<Navigate to="/letters" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/letters" element={<ProtectedRoute><Letters /></ProtectedRoute>} />
        <Route path="/letters/:id" element={<ProtectedRoute><LetterView /></ProtectedRoute>} />
        <Route path="/write" element={<ProtectedRoute><Compose /></ProtectedRoute>} />
        <Route path="*" element={<p>Такої сторінки немає. <Link to="/letters">До стосу</Link></p>} />
      </Routes>
    </div>
  );
}