import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EmergencyProvider } from './context/EmergencyContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import TwoFactorAuth from './pages/TwoFactorAuth';
import Dashboard from './pages/Dashboard';
import EmergencyControl from './pages/EmergencyControl';
import LocationManagement from './pages/LocationManagement';
import BuildingCoordinatesEditor from './pages/BuildingCoordinatesEditor';
import CampusNodeManager from './pages/CampusNodeManager';
import SOSAlerts from './pages/SOSAlerts';
import UserMonitoring from './pages/UserMonitoring';
import Analytics from './pages/Analytics';
import DashboardLayout from './components/DashboardLayout';

function App() {
  return (
    <AuthProvider>
      <EmergencyProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/2fa" element={<TwoFactorAuth />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="emergency" element={<EmergencyControl />} />
              <Route path="locations" element={<LocationManagement />} />
              <Route path="coordinates" element={<BuildingCoordinatesEditor />} />
              <Route path="campus-nodes" element={<CampusNodeManager />} />
              <Route path="sos-alerts" element={<SOSAlerts />} />
              <Route path="users" element={<UserMonitoring />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
            
            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </EmergencyProvider>
    </AuthProvider>
  );
}

export default App;
