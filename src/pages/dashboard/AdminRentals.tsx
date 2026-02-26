'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/lib/AuthContext';
import { apiFetch } from '@/lib/api';
import { StatusBadge } from '@/components/ui/Badge';

interface Rental {
  _id: string;
  equipmentId: { _id: string; name: string; category: string } | null;
  userId: { _id: string; name: string; email: string } | null;
  startDate: string;
  endDate: string;
  returnDate: string | null;
  status: string;
  createdAt: string;
}

export default function AdminRentalsPage() {
  return <AppShell role="Admin"><RentalsContent /></AppShell>;
}

function RentalsContent() {
  const { token } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = () => {
    if (!token) return;
    setLoading(true);
    apiFetch('/api/rentals', {}, token)
      .then(d => setRentals(d.rentals))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token]);

  const doAction = async (id: string, action: string) => {
    setActionLoading(id + action);
    try {
      await apiFetch(`/api/rentals/${id}`, { method: 'PATCH', body: JSON.stringify({ action }) }, token!);
      load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const statuses = ['All', 'Requested', 'Approved', 'Late', 'Returned', 'Cancelled'];
  const filtered = filter === 'All' ? rentals : rentals.filter(r => r.status === filter);

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Rental Management</h2>
          <p>Review and manage all rental requests</p>
        </div>
        <span className="badge badge-requested">{rentals.filter(r => r.status === 'Requested').length} Pending</span>
      </div>

      <div className="page-body">
        <div className="filter-bar">
          {statuses.map(s => (
            <button key={s} className={`btn ${filter === s ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>

        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Borrower</th>
                  <th>Rental Period</th>
                  <th>Status</th>
                  <th>Returned</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">📋</div><h3>No rentals found</h3></div></td></tr>
                ) : filtered.map(r => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.equipmentId?.name || 'N/A'}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{r.equipmentId?.category}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{r.userId?.name || 'N/A'}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{r.userId?.email}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>
                        <div>📅 {new Date(r.startDate).toLocaleDateString()}</div>
                        <div>🏁 {new Date(r.endDate).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td><StatusBadge status={r.status} /></td>
                    <td style={{ fontSize: 13, color: r.returnDate ? 'var(--success)' : 'var(--text-muted)' }}>
                      {r.returnDate ? new Date(r.returnDate).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {r.status === 'Requested' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => doAction(r._id, 'approve')} disabled={!!actionLoading}>✅ Approve</button>
                            <button className="btn btn-danger btn-sm" onClick={() => doAction(r._id, 'reject')} disabled={!!actionLoading}>❌ Reject</button>
                          </>
                        )}
                        {(r.status === 'Approved' || r.status === 'Late') && (
                          <button className="btn btn-outline btn-sm" onClick={() => doAction(r._id, 'return')} disabled={!!actionLoading}>📦 Return</button>
                        )}
                      </div>
                    </td>
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
