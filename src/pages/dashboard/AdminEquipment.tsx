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

const EMPTY_FORM = { name: '', category: '', condition: 'Good', maintenanceStatus: false, description: '' };

export default function AdminEquipmentPage() {
  return <AppShell role="Admin"><EquipmentContent /></AppShell>;
}

function EquipmentContent() {
  const { token } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = () => {
    if (!token) return;
    setLoading(true);
    apiFetch('/api/equipment', {}, token)
      .then(d => setEquipment(d.equipment))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setError(''); setShowModal(true); };
  const openEdit = (eq: Equipment) => {
    setEditing(eq);
    setForm({ name: eq.name, category: eq.category, condition: eq.condition, maintenanceStatus: eq.maintenanceStatus, description: eq.description });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      if (editing) {
        await apiFetch(`/api/equipment/${editing._id}`, { method: 'PATCH', body: JSON.stringify(form) }, token!);
      } else {
        await apiFetch('/api/equipment', { method: 'POST', body: JSON.stringify(form) }, token!);
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this equipment?')) return;
    try {
      await apiFetch(`/api/equipment/${id}`, { method: 'DELETE' }, token!);
      load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleMaintenance = async (eq: Equipment) => {
    try {
      await apiFetch(`/api/equipment/${eq._id}`, { method: 'PATCH', body: JSON.stringify({ maintenanceStatus: !eq.maintenanceStatus }) }, token!);
      load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = equipment.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Equipment Management</h2>
          <p>Add, edit, and manage all equipment in inventory</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Equipment</button>
      </div>

      <div className="page-body">
        <div className="filter-bar">
          <input className="form-control" placeholder="🔍 Search equipment..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
        </div>

        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Condition</th>
                  <th>Status</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">🔧</div><h3>No equipment found</h3></div></td></tr>
                ) : filtered.map(eq => (
                  <tr key={eq._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{eq.name}</div>
                      {eq.description && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{eq.description.slice(0, 60)}{eq.description.length > 60 ? '…' : ''}</div>}
                    </td>
                    <td><span style={{ background: '#f3f4f6', padding: '3px 8px', borderRadius: 4, fontSize: 12 }}>{eq.category}</span></td>
                    <td><ConditionBadge condition={eq.condition} /></td>
                    <td>
                      {eq.maintenanceStatus
                        ? <StatusBadge status="Maintenance" />
                        : <span className="badge badge-available">Active</span>}
                    </td>
                    <td><StatusBadge status={eq.maintenanceStatus ? 'Maintenance' : eq.available ? 'Available' : 'Rented'} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(eq)}>✏️ Edit</button>
                        <button className={`btn btn-sm ${eq.maintenanceStatus ? 'btn-success' : 'btn-outline'}`} onClick={() => handleToggleMaintenance(eq)}>
                          {eq.maintenanceStatus ? '✅ Restore' : '🔨 Maintenance'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(eq._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Edit Equipment' : 'Add New Equipment'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Canon EOS R5" />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <input className="form-control" value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="e.g. Camera, Laptop" />
                </div>
                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select className="form-control" value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}>
                    {['Excellent','Good','Fair','Poor'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional description..." />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.maintenanceStatus} onChange={e => setForm({...form, maintenanceStatus: e.target.checked})} />
                  <span className="form-label" style={{ margin: 0 }}>Under Maintenance</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Equipment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
