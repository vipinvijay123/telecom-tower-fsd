import React, { useEffect, useState } from 'react';
import { BarChart3, Download, RefreshCw, Radio, Zap, Battery, Wrench } from 'lucide-react';
import { dashboardApi } from '../services/api';
import { DashboardStats } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';

const monthlyOutageData = [
  { month: 'Apr', outages: 3, resolved: 3 },
  { month: 'May', outages: 5, resolved: 4 },
  { month: 'Jun', outages: 2, resolved: 2 },
  { month: 'Jul', outages: 7, resolved: 6 },
  { month: 'Aug', outages: 4, resolved: 4 },
  { month: 'Sep', outages: 2, resolved: 1 },
];

const Reports = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats().then(res => { setStats(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-container"><div className="spinner spinner-lg" /><p className="text-muted">Loading reports...</p></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Reports & Analytics</h1><p className="page-subtitle">Network performance overview</p></div>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}><Download size={14} /> Export</button>
          <button className="btn btn-secondary btn-sm" onClick={() => window.location.reload()}><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>

      {/* Summary KPI cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Total Towers', value: stats.kpis.totalTowers, color: '#00d4ff', icon: Radio },
            { label: 'Active %', value: `${stats.kpis.totalTowers ? Math.round((stats.kpis.activeTowers / stats.kpis.totalTowers) * 100) : 0}%`, color: '#00ff88', icon: Zap },
            { label: 'Critical Batteries', value: stats.kpis.criticalBatteries, color: '#ff4757', icon: Battery },
            { label: 'Pending Maintenance', value: stats.kpis.pendingMaintenance, color: '#f59e0b', icon: Wrench },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="kpi-card" style={{ '--kpi-color': color, '--kpi-color-dim': `${color}18` } as React.CSSProperties}>
              <div className="kpi-card-header">
                <span className="kpi-label">{label}</span>
                <div className="kpi-icon"><Icon size={16} /></div>
              </div>
              <div className="kpi-value">{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts row 1 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Tower status */}
        {stats && (
          <div className="card">
            <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 700 }}>Tower Status Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats.charts.towerStatusDist} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={true}>
                  {stats.charts.towerStatusDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '8px' }} />
                <Legend formatter={(v) => <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.78rem' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Monthly outages */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 700 }}>Monthly Outage Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyOutageData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '8px' }} />
              <Legend formatter={(v) => <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.78rem' }}>{v}</span>} />
              <Bar dataKey="outages" fill="#ff4757" radius={[4, 4, 0, 0]} name="Outages" />
              <Bar dataKey="resolved" fill="#00ff88" radius={[4, 4, 0, 0]} name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Battery health */}
      {stats && (
        <div className="card mb-4">
          <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 700 }}>Battery Health Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.charts.batteryHealthDist} barSize={60}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '8px' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Count">
                {stats.charts.batteryHealthDist.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Network uptime simulation */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 700 }}>Network Uptime (Last 6 Months)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={[
            { month: 'Apr', uptime: 98.2 }, { month: 'May', uptime: 97.5 },
            { month: 'Jun', uptime: 99.1 }, { month: 'Jul', uptime: 96.8 },
            { month: 'Aug', uptime: 98.7 }, { month: 'Sep', uptime: 97.9 },
          ]}>
            <defs>
              <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[94, 100]} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '8px' }} formatter={(v) => [`${v}%`, 'Uptime']} />
            <Area type="monotone" dataKey="uptime" stroke="#00d4ff" fill="url(#uptimeGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default Reports;
