import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p>Перевіряємо, чи ти вже входила…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return children;
}