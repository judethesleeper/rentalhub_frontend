'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/lib/AuthContext';
import { apiFetch } from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  contactNumber: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  return <AppShell role="Admin"><UsersContent /></AppShell>;
}

function UsersContent() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!token) return;
    apiFetch('/api/users', {}, token)
      .then(d => setUsers(d.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h2>User Management</h2>
          <p>View all registered users</p>
        </div>
        <span style={{ fontSize: 13, color: '#6b7280' }}>{users.length} total users</span>
      </div>

      <div className="page-body">
        <div className="filter-bar">
          <input className="form-control" placeholder="🔍 Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
        </div>

        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Contact</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5}><div className="empty-state"><div className="empty-icon">👥</div><h3>No users found</h3></div></td></tr>
                ) : filtered.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{u.name.charAt(0).toUpperCase()}</div>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: '#4f46e5' }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'Admin' ? 'badge-approved' : 'badge-requested'}`}>{u.role}</span>
                    </td>
                    <td style={{ fontSize: 13, color: '#6b7280' }}>{u.contactNumber || '—'}</td>
                    <td style={{ fontSize: 13, color: '#6b7280' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
