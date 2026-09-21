import React, { useEffect, useState, useCallback } from 'react';
import { ClipboardCheck, Plus, RefreshCw, X } from 'lucide-react';
import { inspectionsApi, towersApi, techniciansApi } from '../services/api';
import { Inspection, Tower, Technician } from '../types';
import { useAuth } from '../contexts/AuthContext';

const STATUS_COLORS: Record<string, string> = { SCHEDULED: '#00d4ff', IN_PROGRESS: '#f59e0b', COMPLETED: '#00ff88', FAILED: '#ff4757' };

const Inspections = () => {
  const { hasRole } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ inspectionId: '', towerId: '', technicianId: '', inspectionDate: '', structuralCondition: 'GOOD', equipmentCondition: 'GOOD', powerCondition: 'GOOD', safetyCondition: 'GOOD', status: 'SCHEDULED', notes: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [iRes, tRes, techRes] = await Promise.all([inspectionsApi.getAll(), towersApi.getAll(), techniciansApi.getAll()]);
      setInspections(iRes.data.data || []); setTowers(tRes.data.data || []); setTechnicians(techRes.data.data || []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setForm({ inspectionId: '', towerId: towers[0]?._id || '', technicianId: technicians[0]?._id || '', inspectionDate: new Date().toISOString().split('T')[0], structuralCondition: 'GOOD', equipmentCondition: 'GOOD', powerCondition: 'GOOD', safetyCondition: 'GOOD', status: 'SCHEDULED', notes: '' }); setEditingId(null); setError(''); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editingId) await inspectionsApi.update(editingId, form); else await inspectionsApi.create(form);
      setShowModal(false); fetch();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Failed to save.');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Inspections</h1><p className="page-subtitle">{inspections.length} inspections recorded</p></div>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" onClick={fetch}><RefreshCw size={14} /></button>
          {hasRole(['ADMIN', 'OPERATOR', 'TECHNICIAN']) && <button className="btn btn-primary btn-sm" onClick={openCreate}><Plus size={14} /> Schedule Inspection</button>}
        </div>
      </div>
      <div className="table-container">
        <table className="table">
          <thead><tr><th>ID</th><th>Tower</th><th>Technician</th><th>Date</th><th>Structural</th><th>Equipment</th><th>Power</th><th>Safety</th><th>Status</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              : inspections.length === 0 ? <tr><td colSpan={9}><div className="empty-state"><ClipboardCheck size={32} /><p>No inspections found</p></div></td></tr>
              : inspections.map(i => {
                const tower = i.towerId as Tower | string;
                const tech = i.technicianId as Technician | string;
                const tName = typeof tower === 'object' ? tower.towerId : 'Unknown';
                const techName = typeof tech === 'object' ? tech.name : 'Unknown';
                return (
                  <tr key={i._id}>
                    <td><span className="text-accent font-semibold">{i.inspectionId}</span></td>
                    <td>{tName}</td><td>{techName}</td>
                    <td>{new Date(i.inspectionDate).toLocaleDateString()}</td>
                    <td><span className="badge badge-info">{i.structuralCondition}</span></td>
                    <td><span className="badge badge-info">{i.equipmentCondition}</span></td>
                    <td><span className="badge badge-info">{i.powerCondition}</span></td>
                    <td><span className="badge badge-info">{i.safetyCondition}</span></td>
                    <td><span className="badge" style={{ background: `${STATUS_COLORS[i.status]}20`, color: STATUS_COLORS[i.status] }}>{i.status}</span></td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '640px' }}>
            <div className="modal-header"><h2 className="modal-title">Schedule Inspection</h2><button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button></div>
            {error && <div className="login-error" style={{ marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="form-group"><label className="form-label">Inspection ID *</label><input type="text" className="form-input" required placeholder="INSP-005" value={form.inspectionId} onChange={e => setForm(f => ({ ...f, inspectionId: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Date *</label><input type="date" className="form-input" required value={form.inspectionDate} onChange={e => setForm(f => ({ ...f, inspectionDate: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Tower *</label><select className="form-input" required value={form.towerId} onChange={e => setForm(f => ({ ...f, towerId: e.target.value }))}>{towers.map(t => <option key={t._id} value={t._id}>{t.towerId} — {t.name}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Technician *</label><select className="form-input" required value={form.technicianId} onChange={e => setForm(f => ({ ...f, technicianId: e.target.value }))}>{technicians.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}</select></div>
                {[{ k: 'structuralCondition', l: 'Structural' }, { k: 'equipmentCondition', l: 'Equipment' }, { k: 'powerCondition', l: 'Power' }, { k: 'safetyCondition', l: 'Safety' }].map(({ k, l }) => (
                  <div className="form-group" key={k}><label className="form-label">{l} Condition</label>
                    <select className="form-input" value={(form as Record<string, string>)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}>
                      {['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'].map(c => <option key={c}>{c}</option>)}
                    </select></div>
                ))}
                <div className="form-group"><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'].map(s => <option key={s}>{s}</option>)}</select></div>
              </div>
              <div className="form-group mb-3"><label className="form-label">Notes</label><textarea className="form-input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: 'vertical' }} /></div>
              <div className="flex gap-2 justify-between">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create Inspection'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Inspections;
