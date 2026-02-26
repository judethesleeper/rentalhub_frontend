import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const adminNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/equipment', label: 'Equipment', icon: '🔧' },
  { href: '/dashboard/rentals', label: 'Rentals', icon: '📋' },
  { href: '/dashboard/users', label: 'Users', icon: '👥' },
];

const borrowerNav: NavItem[] = [
  { href: '/equipment', label: 'Browse Equipment', icon: '🔍' },
  { href: '/my-rentals', label: 'My Rentals', icon: '📋' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const nav = user.role === 'Admin' ? adminNav : borrowerNav;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">R</div>
        <div>
          <h1>RentalHub</h1>
          <span>Equipment Management</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">{user.role === 'Admin' ? 'Admin Menu' : 'Menu'}</div>
        {nav.map((item) => {
          const active = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} to={item.href} className={`nav-item ${active ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">{user.name?.slice(0, 1)?.toUpperCase() || 'U'}</div>
          <div className="user-meta">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
          </div>
        </div>

        <button className="btn btn-ghost" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
