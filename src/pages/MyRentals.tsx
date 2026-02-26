'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/lib/AuthContext';
import { apiFetch } from '@/lib/api';
import { StatusBadge } from '@/components/ui/Badge';

interface Rental {
  _id: string;
  equipmentId: { _id: string; name: string; category: string } | null;
  startDate: string;
  endDate: string;
  returnDate: string | null;
  status: string;
  createdAt: string;
}

export default function MyRentalsPage() {
  return <AppShell><MyRentalsContent /></AppShell>;
}

function MyRentalsContent() {
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
    if (!confirm(`Are you sure you want to ${action} this rental?`)) return;
    setActionLoading(id);
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

  const getDaysInfo = (r: Rental) => {
    const now = new Date();
    const end = new Date(r.endDate);
    const start = new Date(r.startDate);
    if (r.status === 'Returned') return null;
    if (r.status === 'Late') {
      const days = Math.ceil((now.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
      return <span style={{ color: 'var(--warning)', fontSize: 12 }}>⚠️ {days} day(s) overdue</span>;
    }
    if (r.status === 'Approved' && now < start) {
      const days = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return <span style={{ color: 'var(--primary)', fontSize: 12 }}>🔜 Starts in {days} day(s)</span>;
    }
    if (r.status === 'Approved' && now >= start) {
      const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return <span style={{ color: 'var(--success)', fontSize: 12 }}>✅ {days} day(s) remaining</span>;
    }
    return null;
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>My Rentals</h2>
          <p>Track your equipment rental history and active rentals</p>
        </div>
        <a href="/equipment" className="btn btn-primary">+ New Rental</a>
      </div>

      <div className="page-body">
        <div className="filter-bar">
          {statuses.map(s => (
            <button key={s} className={`btn ${filter === s ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>

        {loading ? (
          <div className="loading-page"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No rentals found</h3>
            <p style={{ marginBottom: 16 }}>You haven't made any rental requests yet.</p>
            <a href="/equipment" className="btn btn-primary">Browse Equipment</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(r => (
              <div key={r._id} className="card" style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderLeft: `4px solid ${r.status === 'Approved' ? '#4f46e5' : r.status === 'Late' ? '#d97706' : r.status === 'Returned' ? '#16a34a' : r.status === 'Requested' ? '#7c3aed' : '#d1d5db'}` }}>
                  <div style={{ padding: '16px 20px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{r.equipmentId?.name || 'Unknown Equipment'}</div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{r.equipmentId?.category}</div>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#4b5563' }}>
                      <div>📅 Start: <strong>{new Date(r.startDate).toLocaleDateString()}</strong></div>
                      <div>🏁 End: <strong>{new Date(r.endDate).toLocaleDateString()}</strong></div>
                      {r.returnDate && <div>📦 Returned: <strong>{new Date(r.returnDate).toLocaleDateString()}</strong></div>}
                    </div>
                    <div style={{ marginTop: 8 }}>{getDaysInfo(r)}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>Requested on {new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                  <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center', borderLeft: '1px solid #e5e7eb' }}>
                    {r.status === 'Requested' && (
                      <button className="btn btn-danger btn-sm" onClick={() => doAction(r._id, 'cancel')} disabled={actionLoading === r._id}>
                        ❌ Cancel
                      </button>
                    )}
                    {(r.status === 'Approved' || r.status === 'Late') && (
                      <button className="btn btn-success btn-sm" onClick={() => doAction(r._id, 'return')} disabled={actionLoading === r._id}>
                        📦 Return
                      </button>
                    )}
                    {r.status !== 'Requested' && r.status !== 'Approved' && r.status !== 'Late' && (
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>No actions</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
