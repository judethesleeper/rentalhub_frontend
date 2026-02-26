import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate('/login', { replace: true });
    else if (user.role === 'Admin') navigate('/dashboard', { replace: true });
    else navigate('/equipment', { replace: true });
  }, [user, loading, navigate]);

  return <div className="loading-page"><div className="spinner" /></div>;
}
