import React, { useEffect, useState, useCallback } from 'react';
import { Bell, Plus, RefreshCw, X, CheckCircle } from 'lucide-react';
import { alertsApi, towersApi } from '../services/api';
import { Alert, Tower } from '../types';
import { useAuth } from '../contexts/AuthContext';

const SEVERITY_COLORS: Record<string, string> = { LOW: '#00ff88', MEDIUM: '#f59e0b', HIGH: '#ff6b35', CRITICAL: '#ff4757' };
const STATUS_COLORS: Record<string, string> = { ACTIVE: '#ff4757', ACKNOWLEDGED: '#f59e0b', RESOLVED: '#00ff88' };

const Alerts = () => {
  const { hasRole } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ alertId: '', type: 'TOWER_OFFLINE', towerId: '', severity: 'MEDIUM', message: '' });

  const fetch = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (statusFilter) params.status = statusFilter;
    if (severityFilter) params.severity = severityFilter;
    try {
      const [aRes, tRes] = await Promise.all([alertsApi.getAll(params), towersApi.getAll()]);
      setAlerts(aRes.data.data || []); setTowers(tRes.data.data || []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, [statusFilter, severityFilter]);
  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setForm({ alertId: '', type: 'TOWER_OFFLINE', towerId: towers[0]?._id || '', severity: 'MEDIUM', message: '' }); setError(''); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try { await alertsApi.create(form); setShowModal(false); fetch(); }
    catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Failed to create alert.');
    } finally { setSaving(false); }
  };

  const acknowledgeAlert = async (id: string) => {
    try { await alertsApi.update(id, { status: 'ACKNOWLEDGED' }); fetch(); } catch { /* silent */ }
  };

  const resolveAlert = async (id: string) => {
    try { await alertsApi.update(id, { status: 'RESOLVED' }); fetch(); } catch { /* silent */ }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Alerts</h1><p className="page-subtitle">{alerts.filter(a => a.status === 'ACTIVE').length} active alerts</p></div>
        <div className="flex gap-2 items-center flex-wrap">
          <select className="form-input" style={{ width: '140px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>{['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="form-input" style={{ width: '140px' }} value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
            <option value="">All Severity</option>{['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button className="btn btn-secondary btn-sm" onClick={fetch}><RefreshCw size={14} /></button>
          {hasRole(['ADMIN', 'OPERATOR']) && <button className="btn btn-primary btn-sm" onClick={openCreate}><Plus size={14} /> Add Alert</button>}
        </div>
      </div>
      <div className="table-container">
        <table className="table">
          <thead><tr><th>Alert ID</th><th>Type</th><th>Tower</th><th>Message</th><th>Severity</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              : alerts.length === 0 ? <tr><td colSpan={8}><div className="empty-state"><Bell size={32} /><p>No alerts found</p></div></td></tr>
              : alerts.map(a => {
                const tower = a.towerId as Tower | string;
                const tName = typeof tower === 'object' ? tower.towerId : 'Unknown';
                return (
                  <tr key={a._id}>
                    <td><span className="text-accent font-semibold">{a.alertId}</span></td>
                    <td><span className="badge badge-info text-xs">{a.type.replace('_', ' ')}</span></td>
                    <td>{tName}</td>
                    <td><span className="text-sm" style={{ maxWidth: '220px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.message}</span></td>
                    <td><span className="badge" style={{ background: `${SEVERITY_COLORS[a.severity]}20`, color: SEVERITY_COLORS[a.severity] }}>{a.severity}</span></td>
                    <td><span className="badge" style={{ background: `${STATUS_COLORS[a.status]}20`, color: STATUS_COLORS[a.status] }}>{a.status}</span></td>
                    <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td><div className="flex gap-1">
                      {a.status === 'ACTIVE' && hasRole(['ADMIN', 'OPERATOR']) && <button className="btn btn-sm btn-secondary" onClick={() => acknowledgeAlert(a._id)}>ACK</button>}
                      {a.status !== 'RESOLVED' && hasRole(['ADMIN', 'OPERATOR']) && <button className="btn-icon" onClick={() => resolveAlert(a._id)} title="Resolve" style={{ color: 'var(--color-accent-green)' }}><CheckCircle size={14} /></button>}
                    </div></td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header"><h2 className="modal-title">Create Alert</h2><button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button></div>
            {error && <div className="login-error" style={{ marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="form-group"><label className="form-label">Alert ID *</label><input type="text" className="form-input" required placeholder="ALT-006" value={form.alertId} onChange={e => setForm(f => ({ ...f, alertId: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Tower *</label><select className="form-input" required value={form.towerId} onChange={e => setForm(f => ({ ...f, towerId: e.target.value }))}>{towers.map(t => <option key={t._id} value={t._id}>{t.towerId} — {t.name}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Alert Type</label><select className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>{['TOWER_OFFLINE', 'BATTERY_CRITICAL', 'POWER_FAILURE', 'MAINTENANCE_OVERDUE', 'INSPECTION_OVERDUE', 'EQUIPMENT_FAULT', 'OUTAGE_PROLONGED', 'TEMPERATURE_HIGH', 'CUSTOM'].map(t => <option key={t}>{t}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Severity</label><select className="form-input" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}>{['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(s => <option key={s}>{s}</option>)}</select></div>
              </div>
              <div className="form-group mb-3"><label className="form-label">Alert Message *</label><textarea className="form-input" rows={3} required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ resize: 'vertical' }} /></div>
              <div className="flex gap-2 justify-between">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Alert'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Alerts;
