
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TowerMap from './pages/TowerMap';
import Towers from './pages/Towers';
import Assets from './pages/Assets';
import PowerSystems from './pages/PowerSystems';
import Batteries from './pages/Batteries';
import Inspections from './pages/Inspections';
import MaintenancePage from './pages/Maintenance';
import Outages from './pages/Outages';
import Alerts from './pages/Alerts';
import Technicians from './pages/Technicians';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Protected app routes wrapped in MainLayout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TowerMap />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/towers"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Towers />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assets"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Assets />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/power-systems"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PowerSystems />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/batteries"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Batteries />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inspections"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Inspections />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MaintenancePage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/outages"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Outages />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Alerts />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/technicians"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Technicians />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Reports />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
