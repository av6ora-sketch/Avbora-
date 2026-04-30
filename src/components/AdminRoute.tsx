import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { profile, user, loading } = useAuth();
  
  if (loading) return null;
  
  // Allow the specific user email as admin by default, or if role is admin
  const isAdmin = profile?.role === 'admin' || user?.email === 'contact@avbora.online';
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
}
