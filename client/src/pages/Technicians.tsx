import React, { useEffect, useState, useCallback } from 'react';
import { Users, Plus, RefreshCw, X } from 'lucide-react';
import { techniciansApi, towersApi } from '../services/api';
import { Technician, Tower } from '../types';
import { useAuth } from '../contexts/AuthContext';

const STATUS_COLORS: Record<string, string> = { AVAILABLE: '#00ff88', ASSIGNED: '#00d4ff', ON_LEAVE: '#f59e0b', OFFLINE: '#64748b' };

const Technicians = () => {
  const { hasRole } = useAuth();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ technicianId: '', name: '', email: '', phone: '', specialization: '', status: 'AVAILABLE', yearsOfExperience: '' });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [techRes, tRes] = await Promise.all([techniciansApi.getAll(), towersApi.getAll()]);
      setTechnicians(techRes.data.data || []); setTowers(tRes.data.data || []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setForm({ technicianId: '', name: '', email: '', phone: '', specialization: '', status: 'AVAILABLE', yearsOfExperience: '' }); setEditingId(null); setError(''); setShowModal(true); };
  const openEdit = (t: Technician) => { setForm({ technicianId: t.technicianId, name: t.name, email: t.email, phone: t.phone, specialization: t.specialization.join(', '), status: t.status, yearsOfExperience: String(t.yearsOfExperience || '') }); setEditingId(t._id); setError(''); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const data = { ...form, specialization: form.specialization ? form.specialization.split(',').map(s => s.trim()) : [], yearsOfExperience: Number(form.yearsOfExperience) || 0 };
      if (editingId) await techniciansApi.update(editingId, data); else await techniciansApi.create(data);
      setShowModal(false); fetch();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Failed to save.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this technician?')) return;
    try { await techniciansApi.delete(id); fetch(); } catch { /* silent */ }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Technicians</h1><p className="page-subtitle">{technicians.length} technicians in the team</p></div>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" onClick={fetch}><RefreshCw size={14} /></button>
          {hasRole(['ADMIN']) && <button className="btn btn-primary btn-sm" onClick={openCreate}><Plus size={14} /> Add Technician</button>}
        </div>
      </div>
      <div className="table-container">
        <table className="table">
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Specialization</th><th>Experience</th><th>Assigned Towers</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              : technicians.length === 0 ? <tr><td colSpan={9}><div className="empty-state"><Users size={32} /><p>No technicians found</p></div></td></tr>
              : technicians.map(t => (
                <tr key={t._id}>
                  <td><span className="text-accent font-semibold">{t.technicianId}</span></td>
                  <td><span className="font-semibold">{t.name}</span></td>
                  <td><span className="text-secondary text-sm">{t.email}</span></td>
                  <td>{t.phone}</td>
                  <td><span className="text-sm text-secondary">{t.specialization.slice(0, 2).join(', ')}{t.specialization.length > 2 ? '...' : ''}</span></td>
                  <td>{t.yearsOfExperience ? `${t.yearsOfExperience}y` : '—'}</td>
                  <td>{Array.isArray(t.assignedTowers) ? t.assignedTowers.length : 0} towers</td>
                  <td><span className="badge" style={{ background: `${STATUS_COLORS[t.status]}20`, color: STATUS_COLORS[t.status] }}>{t.status}</span></td>
                  <td><div className="flex gap-1">
                    {hasRole(['ADMIN', 'OPERATOR']) && <button className="btn-icon" onClick={() => openEdit(t)} title="Edit">✏️</button>}
                    {hasRole(['ADMIN']) && <button className="btn-icon" onClick={() => handleDelete(t._id)} title="Delete" style={{ color: 'var(--color-accent-red)' }}>🗑️</button>}
                  </div></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header"><h2 className="modal-title">{editingId ? 'Edit' : 'Add'} Technician</h2><button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button></div>
            {error && <div className="login-error" style={{ marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {[{ k: 'technicianId', l: 'Technician ID', r: true, p: 'TECH-003' }, { k: 'name', l: 'Full Name', r: true, p: 'John Smith' }, { k: 'email', l: 'Email', r: true, p: 'john@telecom.com' }, { k: 'phone', l: 'Phone', r: true, p: '+91-9876543212' }, { k: 'yearsOfExperience', l: 'Years of Experience', p: '5' }].map(({ k, l, r, p }) => (
                  <div className="form-group" key={k}><label className="form-label">{l}{r && ' *'}</label><input type="text" className="form-input" required={r} placeholder={p} value={(form as Record<string, string>)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} /></div>
                ))}
                <div className="form-group"><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{['AVAILABLE', 'ASSIGNED', 'ON_LEAVE', 'OFFLINE'].map(s => <option key={s}>{s}</option>)}</select></div>
              </div>
              <div className="form-group mb-3"><label className="form-label">Specialization (comma-separated)</label><input type="text" className="form-input" placeholder="Tower Maintenance, Power Systems" value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} /></div>
              <div className="flex gap-2 justify-between">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Technicians;
