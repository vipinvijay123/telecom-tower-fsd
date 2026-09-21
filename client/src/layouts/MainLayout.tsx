import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Radio,
  Package,
  Zap,
  Battery,
  ClipboardCheck,
  Wrench,
  AlertTriangle,
  Bell,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Map,
  Menu,
  X,
  Signal,
  ChevronRight,
} from 'lucide-react';
import './MainLayout.css';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/map', icon: Map, label: 'Tower Map' },
  { to: '/towers', icon: Radio, label: 'Towers' },
  { to: '/assets', icon: Package, label: 'Assets' },
  { to: '/power-systems', icon: Zap, label: 'Power Systems' },
  { to: '/batteries', icon: Battery, label: 'Batteries' },
  { to: '/inspections', icon: ClipboardCheck, label: 'Inspections' },
  { to: '/maintenance', icon: Wrench, label: 'Maintenance' },
  { to: '/outages', icon: AlertTriangle, label: 'Outages' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/technicians', icon: Users, label: 'Technicians' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'var(--color-accent-blue)';
      case 'OPERATOR': return 'var(--color-accent-green)';
      case 'TECHNICIAN': return 'var(--color-accent-orange)';
      default: return 'var(--color-text-muted)';
    }
  };

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Sidebar ────────────────────────────────────────────────────────── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Signal size={20} color="var(--color-accent-blue)" />
          </div>
          <div className="logo-text">
            <span className="logo-title">TowerOps</span>
            <span className="logo-subtitle">Management System</span>
          </div>
          <button className="btn-icon sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} className="nav-icon" />
              <span className="nav-label">{label}</span>
              <ChevronRight size={14} className="nav-arrow" />
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role" style={{ color: getRoleColor(user?.role || '') }}>
              {user?.role}
            </span>
          </div>
          <button className="btn-icon logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ─── Main Content ────────────────────────────────────────────────────── */}
      <div className="main-wrapper">
        {/* Header */}
        <header className="main-header">
          <button
            className="btn-icon menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="header-right">
            <div className="header-status">
              <span className="status-dot" />
              <span className="text-xs text-muted">SYSTEM ONLINE</span>
            </div>
            <div className="header-user">
              <div className="header-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="header-user-info">
                <span className="header-user-name">{user?.name}</span>
                <span className="header-user-email text-xs text-muted">{user?.email}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
