import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';

export default function AdminProtectedRoute() {
  const { isAuthenticated, loading, authError } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-[#f4f6f3] text-sm text-[#718077]">Checking admin access...</main>;
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location, message: authError || 'Sign in to continue.' }} to="/login" />;
  }

  return <Outlet />;
}