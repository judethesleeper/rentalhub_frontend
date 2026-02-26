import React, { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import Sidebar from './Sidebar';

export default function AppShell({
  children,
  role,
}: {
  children: ReactNode;
  role?: 'Admin' | 'Borrower';
}) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (location.pathname !== '/login' && location.pathname !== '/register') {
        navigate('/login', { replace: true });
      }
      return;
    }

    if (role && user.role !== role) {
      navigate(user.role === 'Admin' ? '/dashboard' : '/equipment', { replace: true });
    }
  }, [user, loading, role, navigate, location.pathname]);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!user) return null;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}
