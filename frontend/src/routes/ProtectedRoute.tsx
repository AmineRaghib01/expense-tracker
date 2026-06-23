import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, fetchProfile } = useAuthStore();
  const location = useLocation();
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    if (token && !isAuthenticated) {
      fetchProfile();
    }
  }, [token, isAuthenticated, fetchProfile]);

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('accessToken');
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
