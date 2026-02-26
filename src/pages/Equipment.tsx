'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/lib/AuthContext';
import { apiFetch } from '@/lib/api';
import { StatusBadge, ConditionBadge } from '@/components/ui/Badge';

interface Equipment {
  _id: string;
  name: string;
  category: string;
  condition: string;
  maintenanceStatus: boolean;
  description: string;
  available: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  Camera: '📷', Laptop: '💻', Projector: '📽️', Drone: '🚁', Audio: '🎙️',
  Video: '🎬', Lab: '🔬', Sports: '⚽', 'IT Equipment': '🖥️', Default: '🔧'
};

function getCategoryIcon(category: string) {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.Default;
}

export default function EquipmentPage() {
  return <AppShell><EquipmentContent /></AppShell>;
}

function EquipmentContent() {
  const { token, user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Equipment | null>(null);
  const [form, setForm] = useState({ startDate: '', endDate: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    if (!token) return;
    setLoading(true);
    apiFetch('/api/equipment', {}, token)
      .then(d => setEquipment(d.equipment))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token]);

  const categories = ['All', ...Array.from(new Set(equipment.map(e => e.category)))];

  const filtered = equipment.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'All' || e.category === categoryFilter;
    const matchAvail = availabilityFilter === 'All' || (availabilityFilter === 'Available' ? e.available && !e.maintenanceStatus : !e.available || e.maintenanceStatus);
    return matchSearch && matchCategory && matchAvail;
  });

  const openRent = (eq: Equipment) => {
    setSelected(eq);
    setForm({ startDate: '', endDate: '' });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.startDate || !form.endDate) { setError('Please select start and end dates'); return; }
    setSubmitting(true); setError('');
    try {
      await apiFetch('/api/rentals', {
        method: 'POST',
        body: JSON.stringify({ equipmentId: selected!._id, startDate: form.startDate, endDate: form.endDate }),
      }, token!);
      setSuccess('Rental request submitted! Awaiting admin approval.');
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Browse Equipment</h2>
          <p>Find and request equipment for your needs</p>
        </div>
        <a href="/my-rentals" className="btn btn-outline">📋 My Rentals</a>
      </div>

      <div className="page-body">
        <div className="filter-bar">
          <input className="form-control" placeholder="🔍 Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 240 }} />
          <select className="form-control" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ maxWidth: 160 }}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="form-control" value={availabilityFilter} onChange={e => setAvailabilityFilter(e.target.value)} style={{ maxWidth: 160 }}>
            <option>All</option>
            <option>Available</option>
            <option>Unavailable</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-page"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🔍</div><h3>No equipment found</h3><p>Try adjusting your filters</p></div>
        ) : (
          <div className="equipment-grid">
            {filtered.map(eq => {
              const status = eq.maintenanceStatus ? 'Maintenance' : eq.available ? 'Available' : 'Rented';
              return (
                <div key={eq._id} className="equipment-card">
                  <div className="equipment-card-header">
                    <div className="equipment-card-icon">{getCategoryIcon(eq.category)}</div>
                    <div className="equipment-card-name">{eq.name}</div>
                    <div className="equipment-card-category">{eq.category}</div>
                  </div>
                  <div className="equipment-card-body">
                    <div className="equipment-card-meta">
                      <StatusBadge status={status} />
                      <ConditionBadge condition={eq.condition} />
                    </div>
                    {eq.description && <p className="equipment-card-desc">{eq.description}</p>}
                  </div>
                  <div className="equipment-card-footer">
                    {eq.available && !eq.maintenanceStatus ? (
                      <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openRent(eq)}>
                        📅 Request Rental
                      </button>
                    ) : (
                      <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} disabled>
                        {eq.maintenanceStatus ? '🔨 Under Maintenance' : '⏳ Unavailable'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Request Rental</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 24 }}>{getCategoryIcon(selected.category)}</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>{selected.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{selected.category} · <ConditionBadge condition={selected.condition} /></div>
                  </div>
                </div>
              </div>

              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              {!success && (
                <>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Start Date *</label>
                      <input type="date" className="form-control" value={form.startDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => setForm({...form, startDate: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">End Date *</label>
                      <input type="date" className="form-control" value={form.endDate}
                        min={form.startDate || new Date().toISOString().split('T')[0]}
                        onChange={e => setForm({...form, endDate: e.target.value})} />
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, padding: '8px 12px' }}>
                    ⚠️ Your request will be reviewed by an Admin before confirmation.
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>{success ? 'Close' : 'Cancel'}</button>
              {!success && (
                <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Submitting...' : '📤 Submit Request'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
