import React, { useEffect, useState, useCallback } from 'react';
import { Zap, Plus, RefreshCw, X, Pencil } from 'lucide-react';
import { powerSystemsApi, towersApi } from '../services/api';
import { PowerSystem, Tower } from '../types';
import { useAuth } from '../contexts/AuthContext';

const STATUS_COLORS: Record<string, string> = { NORMAL: '#00ff88', WARNING: '#f59e0b', CRITICAL: '#ff4757', OFFLINE: '#64748b' };

const PowerSystems = () => {
  const { hasRole } = useAuth();
  const [systems, setSystems] = useState<PowerSystem[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ towerId: '', mainPowerStatus: 'NORMAL', generatorStatus: 'STANDBY', voltage: '', current: '', powerConsumption: '', generatorRuntime: '', status: 'NORMAL' });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [psRes, tRes] = await Promise.all([powerSystemsApi.getAll(), towersApi.getAll()]);
      setSystems(psRes.data.data || []); setTowers(tRes.data.data || []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setForm({ towerId: towers[0]?._id || '', mainPowerStatus: 'NORMAL', generatorStatus: 'STANDBY', voltage: '220', current: '15', powerConsumption: '3.2', generatorRuntime: '0', status: 'NORMAL' }); setEditingId(null); setError(''); setShowModal(true); };
  const openEdit = (ps: PowerSystem) => { setForm({ towerId: typeof ps.towerId === 'object' ? (ps.towerId as Tower)._id : ps.towerId, mainPowerStatus: ps.mainPowerStatus, generatorStatus: ps.generatorStatus, voltage: String(ps.voltage), current: String(ps.current), powerConsumption: String(ps.powerConsumption), generatorRuntime: String(ps.generatorRuntime), status: ps.status }); setEditingId(ps._id); setError(''); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const data = { ...form, voltage: Number(form.voltage), current: Number(form.current), powerConsumption: Number(form.powerConsumption), generatorRuntime: Number(form.generatorRuntime) };
      if (editingId) await powerSystemsApi.update(editingId, data); else await powerSystemsApi.create(data);
      setShowModal(false); fetch();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Failed to save.');
    } finally { setSaving(false); }
  };

  return (
    <div>
      {/* Full Cover Banner Header */}
      <div className="power-cover-banner" style={{
        position: 'relative',
        borderRadius: 'var(--border-radius-lg)',
        overflow: 'hidden',
        marginBottom: '1.5rem',
        border: '1px solid var(--color-border-active)',
        minHeight: '180px',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '1.5rem',
        backgroundImage: 'linear-gradient(to top, rgba(10, 15, 29, 0.95) 0%, rgba(10, 15, 29, 0.4) 60%, rgba(10, 15, 29, 0.2) 100%), url(/images/power_substation_cover.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-3" style={{ zIndex: 2 }}>
          <div>
            <div className="badge badge-primary mb-1 flex items-center gap-1" style={{ display: 'inline-flex', width: 'fit-content' }}>
              <Zap size={12} /> HIGH-VOLTAGE SUBSTATION & GRID TELEMETRY
            </div>
            <h1 className="page-title" style={{ fontSize: '1.8rem', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>Power Systems & Transformers</h1>
            <p className="page-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Real-time monitoring of main electrical grids, step-down transformers, and backup generators across all tower sites
            </p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary btn-sm" onClick={fetch} style={{ backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.1)' }}><RefreshCw size={14} /> Refresh</button>
            {hasRole(['ADMIN', 'OPERATOR']) && <button className="btn btn-primary btn-sm" onClick={openCreate}><Plus size={14} /> Add Record</button>}
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead><tr><th>Tower</th><th>Main Power</th><th>Generator</th><th>Voltage (V)</th><th>Current (A)</th><th>Consumption (kW)</th><th>Gen Runtime (h)</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              : systems.length === 0 ? <tr><td colSpan={9}><div className="empty-state"><Zap size={32} /><p>No power systems found</p></div></td></tr>
              : systems.map(ps => {
                const tower = ps.towerId as Tower | string;
                const tName = typeof tower === 'object' ? `${tower.towerId}` : 'Unknown';
                return (
                  <tr key={ps._id}>
                    <td><span className="text-accent font-semibold">{tName}</span></td>
                    <td><span className="badge" style={{ background: `${STATUS_COLORS[ps.mainPowerStatus]}20`, color: STATUS_COLORS[ps.mainPowerStatus] }}>{ps.mainPowerStatus}</span></td>
                    <td><span className="badge badge-info">{ps.generatorStatus}</span></td>
                    <td>{ps.voltage.toFixed(1)}</td>
                    <td>{ps.current.toFixed(1)}</td>
                    <td>{ps.powerConsumption.toFixed(2)}</td>
                    <td>{ps.generatorRuntime}h</td>
                    <td><span className="badge" style={{ background: `${STATUS_COLORS[ps.status]}20`, color: STATUS_COLORS[ps.status] }}>{ps.status}</span></td>
                    <td>{hasRole(['ADMIN', 'OPERATOR']) && <button className="btn-icon" onClick={() => openEdit(ps)}><Pencil size={14} /></button>}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header"><h2 className="modal-title">{editingId ? 'Edit' : 'Add'} Power System Record</h2><button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button></div>
            {error && <div className="login-error" style={{ marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="form-group"><label className="form-label">Tower *</label>
                  <select className="form-input" required value={form.towerId} onChange={e => setForm(f => ({ ...f, towerId: e.target.value }))}>
                    {towers.map(t => <option key={t._id} value={t._id}>{t.towerId} — {t.name}</option>)}
                  </select></div>
                {[{ key: 'mainPowerStatus', label: 'Main Power', opts: ['NORMAL', 'WARNING', 'CRITICAL', 'OFFLINE'] }, { key: 'generatorStatus', label: 'Generator', opts: ['RUNNING', 'STANDBY', 'OFFLINE', 'FAULT'] }, { key: 'status', label: 'Overall Status', opts: ['NORMAL', 'WARNING', 'CRITICAL', 'OFFLINE'] }].map(({ key, label, opts }) => (
                  <div className="form-group" key={key}><label className="form-label">{label}</label>
                    <select className="form-input" value={(form as Record<string, string>)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}>
                      {opts.map(o => <option key={o}>{o}</option>)}
                    </select></div>
                ))}
                {[{ key: 'voltage', label: 'Voltage (V)', ph: '220' }, { key: 'current', label: 'Current (A)', ph: '15' }, { key: 'powerConsumption', label: 'Power Consumption (kW)', ph: '3.2' }, { key: 'generatorRuntime', label: 'Generator Runtime (hours)', ph: '0' }].map(({ key, label, ph }) => (
                  <div className="form-group" key={key}><label className="form-label">{label}</label>
                    <input type="number" className="form-input" placeholder={ph} value={(form as Record<string, string>)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} /></div>
                ))}
              </div>
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
export default PowerSystems;
