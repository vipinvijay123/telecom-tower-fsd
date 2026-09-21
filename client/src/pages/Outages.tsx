import React, { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, Plus, RefreshCw, X } from 'lucide-react';
import { outagesApi, towersApi } from '../services/api';
import { Outage, Tower } from '../types';
import { useAuth } from '../contexts/AuthContext';

const SEVERITY_COLORS: Record<string, string> = { LOW: '#00ff88', MEDIUM: '#f59e0b', HIGH: '#ff6b35', CRITICAL: '#ff4757' };
const STATUS_COLORS: Record<string, string> = { ACTIVE: '#ff4757', INVESTIGATING: '#f59e0b', RESOLVED: '#00ff88' };

const Outages = () => {
  const { hasRole } = useAuth();
  const [outages, setOutages] = useState<Outage[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ outageId: '', towerId: '', cause: '', severity: 'MEDIUM', status: 'ACTIVE', affectedServices: '' });

  const fetch = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (statusFilter) params.status = statusFilter;
    try {
      const [oRes, tRes] = await Promise.all([outagesApi.getAll(params), towersApi.getAll()]);
      setOutages(oRes.data.data || []); setTowers(tRes.data.data || []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, [statusFilter]);
  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setForm({ outageId: '', towerId: towers[0]?._id || '', cause: '', severity: 'MEDIUM', status: 'ACTIVE', affectedServices: '' }); setError(''); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const data = { ...form, affectedServices: form.affectedServices ? form.affectedServices.split(',').map(s => s.trim()) : [] };
      await outagesApi.create(data);
      setShowModal(false); fetch();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Failed to report outage.');
    } finally { setSaving(false); }
  };

  const resolveOutage = async (id: string) => {
    try { await outagesApi.update(id, { status: 'RESOLVED', endTime: new Date().toISOString() }); fetch(); } catch { /* silent */ }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Outages</h1><p className="page-subtitle">{outages.length} outage records</p></div>
        <div className="flex gap-2 items-center flex-wrap">
          <select className="form-input" style={{ width: '140px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>{['ACTIVE', 'INVESTIGATING', 'RESOLVED'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button className="btn btn-secondary btn-sm" onClick={fetch}><RefreshCw size={14} /></button>
          {hasRole(['ADMIN', 'OPERATOR']) && <button className="btn btn-primary btn-sm" onClick={openCreate}><Plus size={14} /> Report Outage</button>}
        </div>
      </div>
      <div className="table-container">
        <table className="table">
          <thead><tr><th>Outage ID</th><th>Tower</th><th>Start Time</th><th>Duration</th><th>Cause</th><th>Severity</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              : outages.length === 0 ? <tr><td colSpan={8}><div className="empty-state"><AlertTriangle size={32} /><p>No outages found</p></div></td></tr>
              : outages.map(o => {
                const tower = o.towerId as Tower | string;
                const tName = typeof tower === 'object' ? `${tower.towerId}` : 'Unknown';
                return (
                  <tr key={o._id}>
                    <td><span className="text-accent font-semibold">{o.outageId}</span></td>
                    <td>{tName}</td>
                    <td>{new Date(o.startTime).toLocaleString()}</td>
                    <td>{o.durationMinutes ? `${Math.round(o.durationMinutes / 60)}h ${o.durationMinutes % 60}m` : o.status !== 'RESOLVED' ? <span className="text-warning">Ongoing</span> : '—'}</td>
                    <td><span className="text-sm text-secondary">{o.cause || '—'}</span></td>
                    <td><span className="badge" style={{ background: `${SEVERITY_COLORS[o.severity]}20`, color: SEVERITY_COLORS[o.severity] }}>{o.severity}</span></td>
                    <td><span className="badge" style={{ background: `${STATUS_COLORS[o.status]}20`, color: STATUS_COLORS[o.status] }}>{o.status}</span></td>
                    <td>{o.status !== 'RESOLVED' && hasRole(['ADMIN', 'OPERATOR']) && (
                      <button className="btn btn-sm btn-secondary" onClick={() => resolveOutage(o._id)}>Resolve</button>
                    )}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header"><h2 className="modal-title">Report Outage</h2><button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button></div>
            {error && <div className="login-error" style={{ marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="form-group"><label className="form-label">Outage ID *</label><input type="text" className="form-input" required placeholder="OUT-004" value={form.outageId} onChange={e => setForm(f => ({ ...f, outageId: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Tower *</label><select className="form-input" required value={form.towerId} onChange={e => setForm(f => ({ ...f, towerId: e.target.value }))}>{towers.map(t => <option key={t._id} value={t._id}>{t.towerId} — {t.name}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Severity</label><select className="form-input" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}>{['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(s => <option key={s}>{s}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{['ACTIVE', 'INVESTIGATING', 'RESOLVED'].map(s => <option key={s}>{s}</option>)}</select></div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Cause</label><input type="text" className="form-input" placeholder="Power grid failure" value={form.cause} onChange={e => setForm(f => ({ ...f, cause: e.target.value }))} /></div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Affected Services (comma-separated)</label><input type="text" className="form-input" placeholder="4G LTE, 5G NR" value={form.affectedServices} onChange={e => setForm(f => ({ ...f, affectedServices: e.target.value }))} /></div>
              </div>
              <div className="flex gap-2 justify-between">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Reporting...' : 'Report Outage'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Outages;
