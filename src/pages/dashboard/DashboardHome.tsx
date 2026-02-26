'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/lib/AuthContext';
import { apiFetch } from '@/lib/api';

interface DashboardData {
  totalEquipment: number;
  totalUsers: number;
  activeRentals: number;
  completedRentals: number;
  overdueRentals: number;
  pendingRequests: number;
  rentalsToday: number;
  upcomingRentals: number;
  availability: { available: number; rented: number; maintenance: number };
  topEquipment: { id: string; name: string; count: number }[];
}

export default function DashboardPage() {
  return (
    <AppShell role="Admin">
      <DashboardContent />
    </AppShell>
  );
}

function DashboardContent() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch('/api/dashboard', {}, token)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!data) return null;

  const maxRentals = Math.max(...(data.topEquipment.map(e => e.count) || [1]), 1);

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Overview of rental operations and equipment status</p>
        </div>
        <div style={{ fontSize: 13, color: '#6b7280' }}>
          🕒 Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="page-body">
        {/* Stats row 1 */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon">🔧</div>
            <div className="stat-label">Total Equipment</div>
            <div className="stat-value">{data.totalEquipment}</div>
            <div className="stat-sub">{data.availability.available} available</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-label">Registered Users</div>
            <div className="stat-value">{data.totalUsers}</div>
            <div className="stat-sub">Active borrowers</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-label">Active Rentals</div>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>{data.activeRentals}</div>
            <div className="stat-sub">Currently in progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-label">Overdue Returns</div>
            <div className="stat-value" style={{ color: 'var(--warning)' }}>{data.overdueRentals}</div>
            <div className="stat-sub">Past due date</div>
          </div>
        </div>

        {/* Stats row 2 */}
        <div className="stat-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-label">Pending Requests</div>
            <div className="stat-value" style={{ color: '#7c3aed' }}>{data.pendingRequests}</div>
            <div className="stat-sub">Awaiting approval</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-label">Completed Rentals</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>{data.completedRentals}</div>
            <div className="stat-sub">Returned equipment</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-label">Rentals Today</div>
            <div className="stat-value">{data.rentalsToday}</div>
            <div className="stat-sub">Submitted today</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔜</div>
            <div className="stat-label">Upcoming Rentals</div>
            <div className="stat-value">{data.upcomingRentals}</div>
            <div className="stat-sub">Approved but not started</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Availability summary */}
          <div className="card">
            <div className="card-header"><h3>Equipment Availability</h3></div>
            <div className="card-body">
              {[
                { label: 'Available', count: data.availability.available, color: '#16a34a', bg: '#dcfce7' },
                { label: 'Rented', count: data.availability.rented, color: '#dc2626', bg: '#fee2e2' },
                { label: 'Maintenance', count: data.availability.maintenance, color: '#6b7280', bg: '#f3f4f6' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color }} />
                    <span style={{ fontSize: 14 }}>{item.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 120, height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${data.totalEquipment ? (item.count / data.totalEquipment) * 100 : 0}%`, height: '100%', background: item.color, borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, minWidth: 24, textAlign: 'right' }}>{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top equipment */}
          <div className="card">
            <div className="card-header"><h3>Top 3 Most Rented Equipment</h3></div>
            <div className="card-body">
              {data.topEquipment.length === 0 ? (
                <div style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No rental data yet</div>
              ) : (
                <div className="chart-bar-wrap">
                  {data.topEquipment.map((eq, i) => (
                    <div key={eq.id} className="chart-bar-item">
                      <div className="chart-bar-val">{eq.count}</div>
                      <div
                        className="chart-bar"
                        style={{ height: `${Math.max(20, (eq.count / maxRentals) * 120)}px`, background: ['#4f46e5','#7c3aed','#a855f7'][i] }}
                      />
                      <div className="chart-bar-label" style={{ textAlign: 'center', maxWidth: 80 }}>{eq.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="card">
          <div className="card-header"><h3>Quick Actions</h3></div>
          <div className="card-body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="/dashboard/rentals" className="btn btn-primary">📋 Manage Rentals</a>
            <a href="/dashboard/equipment" className="btn btn-outline">🔧 Manage Equipment</a>
            <a href="/dashboard/users" className="btn btn-outline">👥 View Users</a>
          </div>
        </div>
      </div>
    </>
  );
}
