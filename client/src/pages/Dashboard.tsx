import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radio, Activity, AlertTriangle, Battery, Zap, Wrench,
  ClipboardCheck, Bell, Users, Package, TrendingUp, Map,
  RefreshCw, ExternalLink,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { dashboardApi } from '../services/api';
import { DashboardStats, RecentActivity, Alert, Outage, Maintenance } from '../types';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#00ff88', MAINTENANCE: '#f59e0b', OFFLINE: '#64748b', CRITICAL: '#ff4757',
  HEALTHY: '#00ff88', WARNING: '#f59e0b', DEAD: '#ff4757',
};

const SEVERITY_COLORS: Record<string, string> = {
  LOW: '#00ff88', MEDIUM: '#f59e0b', HIGH: '#ff6b35', CRITICAL: '#ff4757',
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, recentRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRecent(),
      ]);
      setStats(statsRes.data.data);
      setRecent(recentRes.data.data);
      setLastUpdated(new Date());
    } catch {
      setError('Failed to load dashboard data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const kpiCards = stats ? [
    { label: 'Total Towers', value: stats.kpis.totalTowers, icon: Radio, color: '#00d4ff', colorDim: 'rgba(0,212,255,0.12)', to: '/towers' },
    { label: 'Active Towers', value: stats.kpis.activeTowers, icon: Activity, color: '#00ff88', colorDim: 'rgba(0,255,136,0.12)', to: '/towers?status=ACTIVE' },
    { label: 'Critical Towers', value: stats.kpis.criticalTowers, icon: AlertTriangle, color: '#ff4757', colorDim: 'rgba(255,71,87,0.15)', to: '/towers?status=CRITICAL' },
    { label: 'Offline Towers', value: stats.kpis.offlineTowers, icon: Radio, color: '#64748b', colorDim: 'rgba(100,116,139,0.15)', to: '/towers?status=OFFLINE' },
    { label: 'Total Assets', value: stats.kpis.totalAssets, icon: Package, color: '#7c3aed', colorDim: 'rgba(124,58,237,0.15)', to: '/assets' },
    { label: 'Critical Batteries', value: stats.kpis.criticalBatteries, icon: Battery, color: '#ff4757', colorDim: 'rgba(255,71,87,0.15)', to: '/batteries' },
    { label: 'Active Outages', value: stats.kpis.activeOutages, icon: Zap, color: '#f59e0b', colorDim: 'rgba(245,158,11,0.15)', to: '/outages' },
    { label: 'Pending Maintenance', value: stats.kpis.pendingMaintenance, icon: Wrench, color: '#00d4ff', colorDim: 'rgba(0,212,255,0.12)', to: '/maintenance' },
    { label: 'Upcoming Inspections', value: stats.kpis.upcomingInspections, icon: ClipboardCheck, color: '#00ff88', colorDim: 'rgba(0,255,136,0.12)', to: '/inspections' },
    { label: 'Active Alerts', value: stats.kpis.activeAlerts, icon: Bell, color: '#ff4757', colorDim: 'rgba(255,71,87,0.15)', to: '/alerts' },
    { label: 'Available Technicians', value: stats.kpis.availableTechnicians, icon: Users, color: '#00d4ff', colorDim: 'rgba(0,212,255,0.12)', to: '/technicians' },
    { label: 'Under Maintenance', value: stats.kpis.maintenanceTowers, icon: TrendingUp, color: '#f59e0b', colorDim: 'rgba(245,158,11,0.15)', to: '/towers?status=MAINTENANCE' },
  ] : [];

  if (loading && !stats) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg" />
        <p className="text-muted">Loading Operations Center...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Operations Center</h1>
          <p className="page-subtitle">
            Welcome back, {user?.name} •{' '}
            {lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/map')}
          >
            <Map size={14} /> Tower Map
          </button>
          <button className="btn btn-secondary btn-sm" onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="dashboard-error">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* KPI Grid */}
      <div className="kpi-grid mb-4">
        {kpiCards.map(({ label, value, icon: Icon, color, colorDim, to }) => (
          <div
            key={label}
            className="kpi-card"
            style={{ '--kpi-color': color, '--kpi-color-dim': colorDim } as React.CSSProperties}
            onClick={() => navigate(to)}
            role="button"
            tabIndex={0}
          >
            <div className="kpi-card-header">
              <span className="kpi-label">{label}</span>
              <div className="kpi-icon">
                <Icon size={16} />
              </div>
            </div>
            <div className="kpi-value">{value ?? '—'}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      {stats && (
        <div className="charts-grid mb-4">
          {/* Tower Status Pie */}
          <div className="card">
            <h3 className="chart-title mb-3">Tower Status Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stats.charts.towerStatusDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {stats.charts.towerStatusDist.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }}
                />
                <Legend
                  formatter={(value) => <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.78rem' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Battery Health Bar */}
          <div className="card">
            <h3 className="chart-title mb-3">Battery Health Overview</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.charts.batteryHealthDist} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stats.charts.batteryHealthDist.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Activity Row */}
      {recent && (
        <div className="recent-grid">
          {/* Recent Alerts */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="chart-title">Active Alerts</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/alerts')}>
                View All <ExternalLink size={12} />
              </button>
            </div>
            {recent.recentAlerts.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <Bell size={28} />
                <p>No active alerts</p>
              </div>
            ) : (
              <div className="recent-list">
                {recent.recentAlerts.map((alert: Alert) => (
                  <div key={alert._id} className="recent-item">
                    <div
                      className="recent-severity-bar"
                      style={{ background: SEVERITY_COLORS[alert.severity] }}
                    />
                    <div className="recent-item-content">
                      <p className="recent-item-msg">{alert.message}</p>
                      <span className="recent-item-time">
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <span
                      className="badge"
                      style={{
                        background: `${SEVERITY_COLORS[alert.severity]}20`,
                        color: SEVERITY_COLORS[alert.severity],
                      }}
                    >
                      {alert.severity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Outages */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="chart-title">Active Outages</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/outages')}>
                View All <ExternalLink size={12} />
              </button>
            </div>
            {recent.recentOutages.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <Zap size={28} />
                <p>No active outages</p>
              </div>
            ) : (
              <div className="recent-list">
                {recent.recentOutages.map((outage: Outage) => {
                  const tower = outage.towerId as { name: string; towerId: string } | string;
                  const towerName = typeof tower === 'object' ? tower.name : 'Unknown Tower';
                  return (
                    <div key={outage._id} className="recent-item">
                      <div
                        className="recent-severity-bar"
                        style={{ background: SEVERITY_COLORS[outage.severity] }}
                      />
                      <div className="recent-item-content">
                        <p className="recent-item-msg">{towerName}</p>
                        <span className="recent-item-time">
                          {outage.cause || 'Unknown cause'} •{' '}
                          {new Date(outage.startTime).toLocaleString()}
                        </span>
                      </div>
                      <span
                        className="badge"
                        style={{
                          background: `${STATUS_COLORS[outage.status === 'ACTIVE' ? 'CRITICAL' : 'WARNING']}20`,
                          color: STATUS_COLORS[outage.status === 'ACTIVE' ? 'CRITICAL' : 'WARNING'],
                        }}
                      >
                        {outage.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Maintenance */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="chart-title">Upcoming Maintenance</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/maintenance')}>
                View All <ExternalLink size={12} />
              </button>
            </div>
            {recent.recentMaintenance.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <Wrench size={28} />
                <p>No scheduled maintenance</p>
              </div>
            ) : (
              <div className="recent-list">
                {recent.recentMaintenance.map((m: Maintenance) => {
                  const tower = m.towerId as { name: string } | string;
                  const towerName = typeof tower === 'object' ? tower.name : 'Unknown Tower';
                  const priorityColors: Record<string, string> = {
                    LOW: '#00ff88', MEDIUM: '#f59e0b', HIGH: '#ff6b35', CRITICAL: '#ff4757',
                  };
                  return (
                    <div key={m._id} className="recent-item">
                      <div
                        className="recent-severity-bar"
                        style={{ background: priorityColors[m.priority] || '#64748b' }}
                      />
                      <div className="recent-item-content">
                        <p className="recent-item-msg">{towerName} — {m.maintenanceType}</p>
                        <span className="recent-item-time">
                          {new Date(m.scheduledDate).toLocaleDateString()}
                        </span>
                      </div>
                      <span
                        className="badge"
                        style={{
                          background: `${priorityColors[m.priority] || '#64748b'}20`,
                          color: priorityColors[m.priority] || '#64748b',
                        }}
                      >
                        {m.priority}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
