import React, { useEffect, useState, useCallback } from 'react';
import { Battery as BatteryIcon, Plus, RefreshCw, X, Pencil } from 'lucide-react';
import { batteriesApi, towersApi } from '../services/api';
import { Battery, Tower } from '../types';
import { useAuth } from '../contexts/AuthContext';

const STATUS_COLORS: Record<string, string> = { HEALTHY: '#00ff88', WARNING: '#f59e0b', CRITICAL: '#ff4757', DEAD: '#64748b' };

const Batteries = () => {
  const { hasRole } = useAuth();
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ batteryId: '', towerId: '', batteryType: 'VRLA', capacityAh: '', currentChargePercent: '100', voltage: '48', temperature: '25', healthPercent: '100', backupDurationHours: '8', status: 'HEALTHY', manufacturer: '', model: '' });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, tRes] = await Promise.all([batteriesApi.getAll(), towersApi.getAll()]);
      setBatteries(bRes.data.data || []); setTowers(tRes.data.data || []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setForm({ batteryId: '', towerId: towers[0]?._id || '', batteryType: 'VRLA', capacityAh: '100', currentChargePercent: '100', voltage: '48', temperature: '25', healthPercent: '100', backupDurationHours: '8', status: 'HEALTHY', manufacturer: 'Exide', model: 'PowerSafe' }); setEditingId(null); setError(''); setShowModal(true); };
  const openEdit = (b: Battery) => { setForm({ batteryId: b.batteryId, towerId: typeof b.towerId === 'object' ? (b.towerId as Tower)._id : b.towerId, batteryType: b.batteryType, capacityAh: String(b.capacityAh), currentChargePercent: String(b.currentChargePercent), voltage: String(b.voltage), temperature: String(b.temperature), healthPercent: String(b.healthPercent), backupDurationHours: String(b.backupDurationHours), status: b.status, manufacturer: b.manufacturer || '', model: b.model || '' }); setEditingId(b._id); setError(''); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const data = { ...form, capacityAh: Number(form.capacityAh), currentChargePercent: Number(form.currentChargePercent), voltage: Number(form.voltage), temperature: Number(form.temperature), healthPercent: Number(form.healthPercent), backupDurationHours: Number(form.backupDurationHours) };
      if (editingId) await batteriesApi.update(editingId, data); else await batteriesApi.create(data);
      setShowModal(false); fetch();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Failed to save.');
    } finally { setSaving(false); }
  };

  const getHealthBar = (pct: number) => {
    const color = pct >= 80 ? '#00ff88' : pct >= 50 ? '#f59e0b' : '#ff4757';
    return <div style={{ width: '80px', height: '6px', background: 'var(--color-bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.3s' }} />
    </div>;
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Batteries</h1><p className="page-subtitle">{batteries.length} batteries monitored</p></div>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" onClick={fetch}><RefreshCw size={14} /></button>
          {hasRole(['ADMIN', 'OPERATOR']) && <button className="btn btn-primary btn-sm" onClick={openCreate}><Plus size={14} /> Add Battery</button>}
        </div>
      </div>
      <div className="table-container">
        <table className="table">
          <thead><tr><th>Battery ID</th><th>Tower</th><th>Type</th><th>Capacity</th><th>Charge %</th><th>Health %</th><th>Voltage</th><th>Temp °C</th><th>Backup (h)</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={11} style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              : batteries.length === 0 ? <tr><td colSpan={11}><div className="empty-state"><BatteryIcon size={32} /><p>No batteries found</p></div></td></tr>
              : batteries.map(b => {
                const tower = b.towerId as Tower | string;
                const tName = typeof tower === 'object' ? tower.towerId : 'Unknown';
                return (
                  <tr key={b._id}>
                    <td><span className="text-accent font-semibold">{b.batteryId}</span></td>
                    <td>{tName}</td>
                    <td><span className="badge badge-info">{b.batteryType}</span></td>
                    <td>{b.capacityAh} Ah</td>
                    <td><div className="flex items-center gap-2">{getHealthBar(b.currentChargePercent)}<span className="text-sm">{b.currentChargePercent.toFixed(0)}%</span></div></td>
                    <td><div className="flex items-center gap-2">{getHealthBar(b.healthPercent)}<span className="text-sm">{b.healthPercent.toFixed(0)}%</span></div></td>
                    <td>{b.voltage.toFixed(1)} V</td>
                    <td>{b.temperature.toFixed(1)}</td>
                    <td>{b.backupDurationHours.toFixed(1)}</td>
                    <td><span className="badge" style={{ background: `${STATUS_COLORS[b.status]}20`, color: STATUS_COLORS[b.status] }}>{b.status}</span></td>
                    <td>{hasRole(['ADMIN', 'OPERATOR']) && <button className="btn-icon" onClick={() => openEdit(b)}><Pencil size={14} /></button>}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '640px' }}>
            <div className="modal-header"><h2 className="modal-title">{editingId ? 'Edit' : 'Add'} Battery</h2><button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button></div>
            {error && <div className="login-error" style={{ marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="form-group"><label className="form-label">Battery ID *</label><input type="text" className="form-input" required placeholder="BAT-001" value={form.batteryId} onChange={e => setForm(f => ({ ...f, batteryId: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Tower *</label><select className="form-input" required value={form.towerId} onChange={e => setForm(f => ({ ...f, towerId: e.target.value }))}>{towers.map(t => <option key={t._id} value={t._id}>{t.towerId} — {t.name}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Battery Type</label><select className="form-input" value={form.batteryType} onChange={e => setForm(f => ({ ...f, batteryType: e.target.value }))}>{['VRLA', 'LITHIUM_ION', 'NICKEL_CADMIUM', 'OTHER'].map(t => <option key={t}>{t}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{['HEALTHY', 'WARNING', 'CRITICAL', 'DEAD'].map(s => <option key={s}>{s}</option>)}</select></div>
                {[{ k: 'capacityAh', l: 'Capacity (Ah)', p: '100' }, { k: 'currentChargePercent', l: 'Charge %', p: '100' }, { k: 'healthPercent', l: 'Health %', p: '100' }, { k: 'voltage', l: 'Voltage (V)', p: '48' }, { k: 'temperature', l: 'Temperature (°C)', p: '25' }, { k: 'backupDurationHours', l: 'Backup Duration (h)', p: '8' }].map(({ k, l, p }) => (
                  <div className="form-group" key={k}><label className="form-label">{l}</label><input type="number" className="form-input" placeholder={p} value={(form as Record<string, string>)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} /></div>
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
export default Batteries;
