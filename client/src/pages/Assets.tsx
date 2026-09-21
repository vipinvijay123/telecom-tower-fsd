import { useState, useEffect, useCallback } from 'react';
import { Package, Plus, Pencil, Trash2, RefreshCw, X } from 'lucide-react';
import { assetsApi, towersApi } from '../services/api';
import type { Asset, Tower } from '../types';
import { useAuth } from '../contexts/AuthContext';

const STATUS_COLORS: Record<string, string> = { OPERATIONAL: '#00ff88', FAULTY: '#ff4757', MAINTENANCE: '#f59e0b', DECOMMISSIONED: '#64748b' };

const Assets = () => {
  const { hasRole } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ assetId: '', towerId: '', assetType: 'ANTENNA', manufacturer: '', model: '', serialNumber: '', installationDate: '', status: 'OPERATIONAL', description: '' });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, tRes] = await Promise.all([assetsApi.getAll(statusFilter ? { status: statusFilter } : {}), towersApi.getAll()]);
      setAssets(aRes.data.data || []); setTowers(tRes.data.data || []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setForm({ assetId: '', towerId: towers[0]?._id || '', assetType: 'ANTENNA', manufacturer: '', model: '', serialNumber: '', installationDate: '', status: 'OPERATIONAL', description: '' }); setEditingId(null); setError(''); setShowModal(true); };
  const openEdit = (a: Asset) => { setForm({ assetId: a.assetId, towerId: typeof a.towerId === 'object' ? a.towerId._id : a.towerId, assetType: a.assetType, manufacturer: a.manufacturer, model: a.model, serialNumber: a.serialNumber, installationDate: a.installationDate?.split('T')[0] || '', status: a.status, description: a.description || '' }); setEditingId(a._id); setError(''); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editingId) await assetsApi.update(editingId, form); else await assetsApi.create(form);
      setShowModal(false); fetch();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Failed to save asset.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this asset?')) return;
    try { await assetsApi.delete(id); fetch(); } catch { /* silent */ }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Assets</h1><p className="page-subtitle">{assets.length} assets tracked</p></div>
        <div className="flex gap-2 items-center flex-wrap">
          <select className="form-input" style={{ width: '140px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            {['OPERATIONAL', 'FAULTY', 'MAINTENANCE', 'DECOMMISSIONED'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button className="btn btn-secondary btn-sm" onClick={fetch}><RefreshCw size={14} /></button>
          {hasRole(['ADMIN', 'OPERATOR']) && <button className="btn btn-primary btn-sm" onClick={openCreate}><Plus size={14} /> Add Asset</button>}
        </div>
      </div>
      <div className="table-container">
        <table className="table">
          <thead><tr><th>Asset ID</th><th>Tower</th><th>Type</th><th>Manufacturer</th><th>Model</th><th>Serial</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              : assets.length === 0 ? <tr><td colSpan={8}><div className="empty-state"><Package size={32} /><p>No assets found</p></div></td></tr>
              : assets.map(a => {
                const tower = a.towerId as Tower | string;
                const towerName = typeof tower === 'object' ? `${tower.towerId} — ${tower.name}` : 'Unknown';
                return (
                  <tr key={a._id}>
                    <td><span className="text-accent font-semibold">{a.assetId}</span></td>
                    <td>{towerName}</td>
                    <td><span className="badge badge-info">{a.assetType}</span></td>
                    <td>{a.manufacturer}</td><td>{a.model}</td><td className="text-muted text-xs">{a.serialNumber}</td>
                    <td><span className="badge" style={{ background: `${STATUS_COLORS[a.status]}20`, color: STATUS_COLORS[a.status] }}>{a.status}</span></td>
                    <td><div className="flex gap-1">
                      {hasRole(['ADMIN', 'OPERATOR']) && <button className="btn-icon" onClick={() => openEdit(a)} title="Edit"><Pencil size={14} /></button>}
                      {hasRole(['ADMIN']) && <button className="btn-icon" onClick={() => handleDelete(a._id)} title="Delete" style={{ color: 'var(--color-accent-red)' }}><Trash2 size={14} /></button>}
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
            <div className="modal-header"><h2 className="modal-title">{editingId ? 'Edit Asset' : 'Add Asset'}</h2><button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button></div>
            {error && <div className="login-error" style={{ marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {[{ key: 'assetId', label: 'Asset ID', req: true, ph: 'AST-001' }, { key: 'manufacturer', label: 'Manufacturer', req: true, ph: 'Ericsson' }, { key: 'model', label: 'Model', req: true, ph: 'AIR-6000' }, { key: 'serialNumber', label: 'Serial Number', req: true, ph: 'ERI-001' }, { key: 'installationDate', label: 'Installation Date', req: true, type: 'date' }].map(({ key, label, req, ph, type }) => (
                  <div className="form-group" key={key}>
                    <label className="form-label">{label}{req && ' *'}</label>
                    <input type={type || 'text'} className="form-input" required={req} placeholder={ph} value={(form as Record<string, string>)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                  </div>
                ))}
                <div className="form-group"><label className="form-label">Tower *</label>
                  <select className="form-input" required value={form.towerId} onChange={e => setForm(f => ({ ...f, towerId: e.target.value }))}>
                    {towers.map(t => <option key={t._id} value={t._id}>{t.towerId} — {t.name}</option>)}
                  </select></div>
                <div className="form-group"><label className="form-label">Asset Type</label>
                  <select className="form-input" value={form.assetType} onChange={e => setForm(f => ({ ...f, assetType: e.target.value }))}>
                    {['ANTENNA', 'ROUTER', 'BASE_STATION', 'GENERATOR', 'POWER_EQUIPMENT', 'BATTERY', 'CABLE', 'SHELTER', 'OTHER'].map(t => <option key={t}>{t}</option>)}
                  </select></div>
                <div className="form-group"><label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    {['OPERATIONAL', 'FAULTY', 'MAINTENANCE', 'DECOMMISSIONED'].map(s => <option key={s}>{s}</option>)}
                  </select></div>
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
export default Assets;
