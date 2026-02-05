import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ROUTES } from '../../config/constants';

interface ProtectedRouteProps {
  children: ReactNode;
}

// TEMPORARY: disable auth guard so you can browse all pages
// Set this back to false when you want real auth protection.
const DISABLE_AUTH_GUARD = true;

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!DISABLE_AUTH_GUARD && !isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
};
