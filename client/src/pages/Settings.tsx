import React from 'react';
import { Settings as SettingsIcon, User, Shield, Bell, Database, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const { user } = useAuth();

  const roleColor = user?.role === 'ADMIN' ? '#00d4ff' : user?.role === 'OPERATOR' ? '#00ff88' : '#f59e0b';

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Settings</h1><p className="page-subtitle">Account and system configuration</p></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Profile */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <User size={18} color="var(--color-accent-blue)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Account Profile</h3>
          </div>
          <div className="settings-field"><span className="form-label">Full Name</span><span>{user?.name}</span></div>
          <div className="settings-field"><span className="form-label">Email Address</span><span>{user?.email}</span></div>
          <div className="settings-field"><span className="form-label">Role</span><span style={{ color: roleColor, fontWeight: 700 }}>{user?.role}</span></div>
          <div className="settings-field"><span className="form-label">User ID</span><span className="text-muted text-xs">{user?.id}</span></div>
        </div>

        {/* Security */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={18} color="var(--color-accent-green)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Security</h3>
          </div>
          <div className="settings-field"><span className="form-label">Authentication</span><span className="badge badge-active">JWT Active</span></div>
          <div className="settings-field"><span className="form-label">Session Storage</span><span>localStorage</span></div>
          <div className="settings-field"><span className="form-label">Token Expiry</span><span>7 days</span></div>
          <div className="settings-field"><span className="form-label">Password Policy</span><span className="text-secondary text-sm">Min 6 chars required</span></div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={18} color="var(--color-accent-orange)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Notifications</h3>
          </div>
          <div className="settings-field"><span className="form-label">Dashboard Auto-Refresh</span><span className="badge badge-active">Every 60s</span></div>
          <div className="settings-field"><span className="form-label">Alert Types</span><span className="text-secondary text-sm">Tower, Battery, Power, Maintenance</span></div>
          <div className="settings-field"><span className="form-label">Outage Reporting</span><span className="badge badge-active">Enabled</span></div>
        </div>

        {/* System */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Database size={18} color="var(--color-accent-blue)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>System Configuration</h3>
          </div>
          <div className="settings-field"><span className="form-label">Database</span><span>MongoDB Atlas</span></div>
          <div className="settings-field"><span className="form-label">Backend</span><span>Node.js + Express + TypeScript</span></div>
          <div className="settings-field"><span className="form-label">Frontend</span><span>React + Vite + TypeScript</span></div>
          <div className="settings-field"><span className="form-label">Maps Integration</span><span>{import.meta.env.VITE_GOOGLE_MAPS_API_KEY && import.meta.env.VITE_GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE' ? <span className="badge badge-active">Configured</span> : <span className="badge badge-warning">API Key Required</span>}</span></div>
        </div>

        {/* About */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="flex items-center gap-2 mb-3">
            <Info size={18} color="var(--color-text-muted)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>About This Application</h3>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Project', value: 'Telecom Tower Management System' },
              { label: 'Stack', value: 'MERN (MongoDB, Express, React, Node.js)' },
              { label: 'Version', value: '1.0.0' },
              { label: 'Roles', value: 'ADMIN • OPERATOR • TECHNICIAN' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--color-border)' }}>
                <div className="form-label mb-1">{label}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .settings-field {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.6rem 0;
          border-bottom: 1px solid var(--color-border);
          font-size: 0.85rem;
          color: var(--color-text-primary);
        }
        .settings-field:last-child { border-bottom: none; }
        .settings-field .form-label { margin: 0; }
      `}</style>
    </div>
  );
};
export default Settings;
