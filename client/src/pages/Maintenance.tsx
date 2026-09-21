import React, { useEffect, useState, useCallback } from 'react';
import { Wrench, Plus, RefreshCw, X } from 'lucide-react';
import { maintenanceApi, towersApi, techniciansApi } from '../services/api';
import { Maintenance, Tower, Technician } from '../types';
import { useAuth } from '../contexts/AuthContext';

const PRIORITY_COLORS: Record<string, string> = { LOW: '#00ff88', MEDIUM: '#f59e0b', HIGH: '#ff6b35', CRITICAL: '#ff4757' };
const STATUS_COLORS: Record<string, string> = { SCHEDULED: '#00d4ff', IN_PROGRESS: '#f59e0b', COMPLETED: '#00ff88', CANCELLED: '#64748b' };

const MaintenancePage = () => {
  const { hasRole } = useAuth();
  const [records, setRecords] = useState<Maintenance[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ maintenanceId: '', towerId: '', technicianId: '', maintenanceType: 'PREVENTIVE', scheduledDate: '', priority: 'MEDIUM', status: 'SCHEDULED', description: '' });

  const fetch = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (statusFilter) params.status = statusFilter;
    if (priorityFilter) params.priority = priorityFilter;
    try {
      const [mRes, tRes, techRes] = await Promise.all([maintenanceApi.getAll(params), towersApi.getAll(), techniciansApi.getAll()]);
      setRecords(mRes.data.data || []); setTowers(tRes.data.data || []); setTechnicians(techRes.data.data || []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, [statusFilter, priorityFilter]);
  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setForm({ maintenanceId: '', towerId: towers[0]?._id || '', technicianId: technicians[0]?._id || '', maintenanceType: 'PREVENTIVE', scheduledDate: new Date().toISOString().split('T')[0], priority: 'MEDIUM', status: 'SCHEDULED', description: '' }); setEditingId(null); setError(''); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editingId) await maintenanceApi.update(editingId, form); else await maintenanceApi.create(form);
      setShowModal(false); fetch();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Failed to save.');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Maintenance</h1><p className="page-subtitle">{records.length} maintenance records</p></div>
        <div className="flex gap-2 flex-wrap items-center">
          <select className="form-input" style={{ width: '140px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>{['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="form-input" style={{ width: '140px' }} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="">All Priority</option>{['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => <option key={p}>{p}</option>)}
          </select>
          <button className="btn btn-secondary btn-sm" onClick={fetch}><RefreshCw size={14} /></button>
          {hasRole(['ADMIN', 'OPERATOR']) && <button className="btn btn-primary btn-sm" onClick={openCreate}><Plus size={14} /> Schedule</button>}
        </div>
      </div>
      <div className="table-container">
        <table className="table">
          <thead><tr><th>ID</th><th>Tower</th><th>Technician</th><th>Type</th><th>Scheduled</th><th>Priority</th><th>Status</th><th>Description</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              : records.length === 0 ? <tr><td colSpan={8}><div className="empty-state"><Wrench size={32} /><p>No maintenance records found</p></div></td></tr>
              : records.map(m => {
                const tower = m.towerId as Tower | string;
                const tech = m.technicianId as Technician | string | undefined;
                const tName = typeof tower === 'object' ? tower.towerId : 'Unknown';
                const techName = typeof tech === 'object' && tech ? tech.name : '—';
                return (
                  <tr key={m._id}>
                    <td><span className="text-accent font-semibold">{m.maintenanceId}</span></td>
                    <td>{tName}</td><td>{techName}</td>
                    <td><span className="badge badge-info">{m.maintenanceType}</span></td>
                    <td>{new Date(m.scheduledDate).toLocaleDateString()}</td>
                    <td><span className="badge" style={{ background: `${PRIORITY_COLORS[m.priority]}20`, color: PRIORITY_COLORS[m.priority] }}>{m.priority}</span></td>
                    <td><span className="badge" style={{ background: `${STATUS_COLORS[m.status]}20`, color: STATUS_COLORS[m.status] }}>{m.status}</span></td>
                    <td><span className="text-sm text-muted truncate" style={{ maxWidth: '200px', display: 'block' }}>{m.description}</span></td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header"><h2 className="modal-title">Schedule Maintenance</h2><button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button></div>
            {error && <div className="login-error" style={{ marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="form-group"><label className="form-label">Maintenance ID *</label><input type="text" className="form-input" required placeholder="MNT-005" value={form.maintenanceId} onChange={e => setForm(f => ({ ...f, maintenanceId: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Scheduled Date *</label><input type="date" className="form-input" required value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Tower *</label><select className="form-input" required value={form.towerId} onChange={e => setForm(f => ({ ...f, towerId: e.target.value }))}>{towers.map(t => <option key={t._id} value={t._id}>{t.towerId} — {t.name}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Technician</label><select className="form-input" value={form.technicianId} onChange={e => setForm(f => ({ ...f, technicianId: e.target.value }))}><option value="">— Unassigned —</option>{technicians.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Type</label><select className="form-input" value={form.maintenanceType} onChange={e => setForm(f => ({ ...f, maintenanceType: e.target.value }))}>{['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY', 'ROUTINE', 'UPGRADE'].map(t => <option key={t}>{t}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Priority</label><select className="form-input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>{['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => <option key={p}>{p}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => <option key={s}>{s}</option>)}</select></div>
              </div>
              <div className="form-group mb-3"><label className="form-label">Description *</label><textarea className="form-input" rows={3} required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} /></div>
              <div className="flex gap-2 justify-between">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Schedule Maintenance'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default MaintenancePage;
