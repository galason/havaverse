import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2Icon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Route guard. While the session cookie is being validated we hold the route
 * rather than bouncing people to /login; once resolved, unauthenticated
 * visitors are sent to sign in with their intended destination preserved.
 */
export function RequireAuth() {
  const { isAuthenticated, bootstrapping } = useAuth();
  const location = useLocation();

  if (bootstrapping) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" role="status">
        <Loader2Icon className="h-5 w-5 animate-spin text-brand-indigo" aria-hidden="true" />
        <span className="sr-only">Checking your session</span>
      </div>);

  }

  if (!isAuthenticated) {
    const destination = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(destination)}`} replace />;
  }

  return <Outlet />;
}