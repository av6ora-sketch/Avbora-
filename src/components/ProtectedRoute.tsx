import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children, requireProfile = false }: { children: React.ReactNode, requireProfile?: boolean }) {
  const { user, profile } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireProfile && !profile) {
    return <Navigate to="/setup" />;
  }

  if (profile && !requireProfile && window.location.pathname === '/setup') {
    // If they already have a profile, don't let them on the setup page
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}
