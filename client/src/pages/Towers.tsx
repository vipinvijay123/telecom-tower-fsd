import React, { useEffect, useState, useCallback } from 'react';
import { Radio, Plus, Search, Pencil, Trash2, RefreshCw, X, MapPin, Locate } from 'lucide-react';
import { towersApi } from '../services/api';
import type { Tower, TowerStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { LocationPickerModal, LocationData } from '../components/LocationPickerModal';

const STATUS_COLORS: Record<TowerStatus, string> = {
  ACTIVE: '#00ff88', MAINTENANCE: '#f59e0b', OFFLINE: '#64748b', CRITICAL: '#ff4757',
};

const emptyForm = {
  towerId: '', name: '', towerType: 'MONOPOLE', operator: '', status: 'ACTIVE',
  installationDate: '', height: '', description: '',
  'location.address': '', 'location.city': '', 'location.state': '',
  'location.country': 'India', 'location.latitude': '', 'location.longitude': '',
};

const Towers = () => {
  const { hasRole } = useAuth();
  const [towers, setTowers] = useState<Tower[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [locatingCurrent, setLocatingCurrent] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await towersApi.getAll(params);
      setTowers(res.data.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setForm(emptyForm); setEditingId(null); setError(''); setShowModal(true);
  };

  const openEdit = (t: Tower) => {
    setForm({
      towerId: t.towerId, name: t.name, towerType: t.towerType,
      operator: t.operator, status: t.status,
      installationDate: t.installationDate?.split('T')[0] || '',
      height: String(t.height || ''), description: t.description || '',
      'location.address': t.location.address,
      'location.city': t.location.city, 'location.state': t.location.state,
      'location.country': t.location.country,
      'location.latitude': String(t.location.latitude),
      'location.longitude': String(t.location.longitude),
    });
    setEditingId(t._id); setError(''); setShowModal(true);
  };

  const handleLocationSelected = (loc: LocationData) => {
    setForm(f => ({
      ...f,
      'location.latitude': String(loc.latitude),
      'location.longitude': String(loc.longitude),
      'location.address': loc.address || f['location.address'],
      'location.city': loc.city || f['location.city'],
      'location.state': loc.state || f['location.state'],
      'location.country': loc.country || f['location.country'],
    }));
  };

  const handleQuickCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocatingCurrent(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setForm(f => ({
          ...f,
          'location.latitude': String(lat),
          'location.longitude': String(lng),
        }));
        setLocatingCurrent(false);
      },
      () => {
        alert('Could not retrieve current location.');
        setLocatingCurrent(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const data = {
        towerId: form.towerId, name: form.name, towerType: form.towerType,
        operator: form.operator, status: form.status,
        installationDate: form.installationDate, height: Number(form.height) || undefined,
        description: form.description,
        location: {
          address: form['location.address'], city: form['location.city'],
          state: form['location.state'], country: form['location.country'],
          latitude: parseFloat(form['location.latitude']),
          longitude: parseFloat(form['location.longitude']),
        },
      };
      if (editingId) { await towersApi.update(editingId, data); }
      else { await towersApi.create(data); }
      setShowModal(false); fetch();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || 'Failed to save tower.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this tower? This cannot be undone.')) return;
    try { await towersApi.delete(id); fetch(); } catch { /* silent */ }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Towers</h1>
          <p className="page-subtitle">{towers.length} towers in the network</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="input-wrapper" style={{ width: '200px' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', color: 'var(--color-text-muted)' }} />
            <input className="form-input" style={{ paddingLeft: '2.25rem' }} placeholder="Search towers..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-input" style={{ width: '140px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="OFFLINE">Offline</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <button className="btn btn-secondary btn-sm" onClick={fetch}><RefreshCw size={14} /></button>
          {hasRole(['ADMIN', 'OPERATOR']) && (
            <button className="btn btn-primary btn-sm" onClick={openCreate}><Plus size={14} /> Add Tower</button>
          )}
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Tower ID</th><th>Name</th><th>Location</th><th>Type</th>
              <th>Operator</th><th>Status</th><th>Installed</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
            ) : towers.length === 0 ? (
              <tr><td colSpan={8}><div className="empty-state"><Radio size={32} /><p>No towers found</p></div></td></tr>
            ) : towers.map(t => (
              <tr key={t._id}>
                <td><span className="text-accent font-semibold">{t.towerId}</span></td>
                <td><span className="font-semibold">{t.name}</span></td>
                <td>
                  <span>{t.location.city}</span>
                  <br /><span className="text-muted text-xs">{t.location.state}</span>
                </td>
                <td><span className="badge badge-info">{t.towerType}</span></td>
                <td>{t.operator}</td>
                <td>
                  <span className="badge" style={{ background: `${STATUS_COLORS[t.status]}20`, color: STATUS_COLORS[t.status] }}>
                    <span className="badge-dot" style={{ background: STATUS_COLORS[t.status] }} />
                    {t.status}
                  </span>
                </td>
                <td>{new Date(t.installationDate).toLocaleDateString()}</td>
                <td>
                  <div className="flex gap-1">
                    {hasRole(['ADMIN', 'OPERATOR']) && (
                      <button className="btn-icon" onClick={() => openEdit(t)} title="Edit"><Pencil size={14} /></button>
                    )}
                    {hasRole(['ADMIN']) && (
                      <button className="btn-icon" onClick={() => handleDelete(t._id)} title="Delete" style={{ color: 'var(--color-accent-red)' }}><Trash2 size={14} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Tower Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingId ? 'Edit Tower' : 'Add New Tower'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            {error && <div className="login-error mb-3" style={{ marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="form-group">
                  <label className="form-label">Tower ID *</label>
                  <input type="text" className="form-input" required placeholder="TWR-001" value={form.towerId} onChange={e => setForm(f => ({ ...f, towerId: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tower Name *</label>
                  <input type="text" className="form-input" required placeholder="Chennai Central Tower" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Operator *</label>
                  <input type="text" className="form-input" required placeholder="TelecomCo India" value={form.operator} onChange={e => setForm(f => ({ ...f, operator: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Installation Date *</label>
                  <input type="date" className="form-input" required value={form.installationDate} onChange={e => setForm(f => ({ ...f, installationDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Height (meters)</label>
                  <input type="number" className="form-input" placeholder="45" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tower Type</label>
                  <select className="form-input" value={form.towerType} onChange={e => setForm(f => ({ ...f, towerType: e.target.value }))}>
                    {['MONOPOLE', 'LATTICE', 'GUYED', 'STEALTH', 'ROOFTOP', 'OTHER'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Map & Location Selection Section */}
              <div className="card mb-3" style={{ background: 'rgba(0, 212, 255, 0.03)', borderColor: 'var(--color-border-active)' }}>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-accent" />
                    <span className="font-semibold text-sm">Tower Location & Map Coordinates</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleQuickCurrentLocation}
                      disabled={locatingCurrent}
                      title="Use device current GPS coordinates"
                    >
                      <Locate size={14} className="text-accent" />
                      {locatingCurrent ? 'Locating...' : 'Current GPS'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowLocationPicker(true)}
                    >
                      <MapPin size={14} /> Search & Plot on Map
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="form-label">Address *</label>
                    <input type="text" className="form-input" required placeholder="Anna Salai" value={form['location.address']} onChange={e => setForm(f => ({ ...f, 'location.address': e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input type="text" className="form-input" required placeholder="Chennai" value={form['location.city']} onChange={e => setForm(f => ({ ...f, 'location.city': e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input type="text" className="form-input" required placeholder="Tamil Nadu" value={form['location.state']} onChange={e => setForm(f => ({ ...f, 'location.state': e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country *</label>
                    <input type="text" className="form-input" required placeholder="India" value={form['location.country']} onChange={e => setForm(f => ({ ...f, 'location.country': e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Latitude *</label>
                    <input type="number" step="any" className="form-input" required placeholder="13.0827" value={form['location.latitude']} onChange={e => setForm(f => ({ ...f, 'location.latitude': e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Longitude *</label>
                    <input type="number" step="any" className="form-input" required placeholder="80.2707" value={form['location.longitude']} onChange={e => setForm(f => ({ ...f, 'location.longitude': e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    {['ACTIVE', 'MAINTENANCE', 'OFFLINE', 'CRITICAL'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional notes about this tower" style={{ resize: 'vertical' }} />
              </div>

              <div className="flex gap-2 justify-between">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update Tower' : 'Create Tower'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Location Picker Modal */}
      <LocationPickerModal
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        initialLocation={{
          latitude: parseFloat(form['location.latitude']) || undefined,
          longitude: parseFloat(form['location.longitude']) || undefined,
          address: form['location.address'],
          city: form['location.city'],
          state: form['location.state'],
          country: form['location.country'],
        }}
        onSelectLocation={handleLocationSelected}
      />
    </div>
  );
};

export default Towers;

